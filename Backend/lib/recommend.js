/**
 * Suggestion engine. Plain weighted scoring over signals already in the database
 * (follows, likes, dislikes, saves, comments, chosen topics), so every result can
 * explain itself. Nothing here needs a background job: profiles are built on demand
 * and cached briefly in Redis (or memory).
 */
const { Category } = require("@prisma/client");
const prisma = require("./prisma");
const { getValue, setValue, removeKeys, remember } = require("./store");

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const PROFILE_TTL_MS = 5 * 60 * 1000;
const FEED_TTL_MS = 10 * 60 * 1000;
const TRENDING_TTL_MS = 5 * 60 * 1000;
const INTEREST_HALF_LIFE_DAYS = 30;
const MAX_FEED = 300;

// How much each action says about what someone likes.
const TOPIC_WEIGHTS = { chosen: 3, save: 4, comment: 3, like: 2, own: 1, dislike: -3 };
const AUTHOR_WEIGHTS = { follow: 3, save: 2, comment: 1.5, like: 1, dislike: -2 };

const CATEGORY_LABELS = Object.fromEntries(
  Object.values(Category).map((name) => [name, name.replace(/_/g, " ").replace(" and ", " & ")])
);
const topicLabel = (category) => CATEGORY_LABELS[category] || category;

const decay = (date, now = Date.now()) => {
  if (!date) return 0.5; // rows from before timestamps existed count as "a while ago"
  const ageDays = Math.max(0, (now - new Date(date).getTime()) / DAY_MS);
  return 0.5 ** (ageDays / INTEREST_HALF_LIFE_DAYS);
};

const addTo = (map, key, amount) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + amount);
};

const toObject = (map) => Object.fromEntries(map);
const toMap = (object) => new Map(Object.entries(object || {}));

// ---------------------------------------------------------------------------
// Interest profile
// ---------------------------------------------------------------------------

const profileKey = (userId) => `reco:profile:${userId}`;
const feedKey = (userId) => `reco:feed:${userId}`;

/** Call after anything that changes someone's signals (like, save, follow, comment...). */
const forgetUser = (userId) => (userId ? removeKeys(profileKey(userId)) : Promise.resolve());

const postSelect = { id: true, category: true, userId: true, createdAt: true };

const computeProfile = async (userId) => {
  const [user, follows, likes, dislikes, saves, comments, ownPosts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { interests: true } }),
    prisma.follows.findMany({ where: { followerId: userId }, select: { followingId: true } }),
    prisma.like.findMany({
      where: { userId },
      select: { createdAt: true, post: { select: postSelect } },
    }),
    prisma.unlike.findMany({
      where: { userId },
      select: { createdAt: true, post: { select: postSelect } },
    }),
    prisma.savedPosts.findMany({
      where: { userId },
      select: { createdAt: true, post: { select: postSelect } },
    }),
    prisma.comment.findMany({
      where: { commentor: userId },
      select: { createdAt: true, post: { select: postSelect } },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    prisma.posts.findMany({ where: { userId }, select: postSelect }),
  ]);

  const now = Date.now();
  const topics = new Map();
  const authors = new Map();
  const following = follows.map((row) => row.followingId);
  const excluded = new Set();

  for (const category of user?.interests || []) addTo(topics, category, TOPIC_WEIGHTS.chosen);
  for (const id of following) addTo(authors, id, AUTHOR_WEIGHTS.follow);

  const apply = (rows, kind) => {
    for (const row of rows) {
      if (!row.post) continue;
      const weight = decay(row.createdAt || row.post.createdAt, now);
      addTo(topics, row.post.category, TOPIC_WEIGHTS[kind] * weight);
      if (row.post.userId !== userId) {
        addTo(authors, row.post.userId, AUTHOR_WEIGHTS[kind] * weight);
      }
    }
  };
  apply(likes, "like");
  apply(saves, "save");
  apply(comments, "comment");
  apply(dislikes, "dislike");
  for (const post of ownPosts) {
    addTo(topics, post.category, TOPIC_WEIGHTS.own * decay(post.createdAt, now));
  }

  for (const row of dislikes) if (row.post) excluded.add(row.post.id);

  return {
    topics: toObject(topics),
    authors: toObject(authors),
    following,
    excluded: [...excluded],
    seen: [...likes, ...saves, ...comments].map((row) => row.post?.id).filter(Boolean),
    chosen: user?.interests || [],
  };
};

const getProfile = async (userId) => {
  const raw = await remember(profileKey(userId), PROFILE_TTL_MS, () => computeProfile(userId));
  return {
    ...raw,
    topics: toMap(raw.topics),
    authors: toMap(raw.authors),
    following: new Set(raw.following),
    excluded: new Set(raw.excluded),
    seen: new Set(raw.seen),
  };
};

/** Topics ordered by interest, strongest first (positive interest only). */
const topTopics = (profile, count = 5) =>
  [...profile.topics.entries()]
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([topic]) => topic);

const normalizer = (map) => {
  const max = Math.max(0, ...map.values());
  return (key) => (max > 0 ? Math.max(0, map.get(key) || 0) / max : 0);
};

// ---------------------------------------------------------------------------
// Post popularity: Hacker News style gravity so new posts aren't buried.
// ---------------------------------------------------------------------------

const engagementOf = (post) =>
  Math.max(
    0,
    (post.likes || 0) +
      2 * (post._count?.comment || 0) +
      3 * (post._count?.savedPosts || 0) -
      (post.unlikes || 0)
  );

const hotness = (post, now = Date.now()) => {
  const ageHours = Math.max(0, (now - new Date(post.createdAt).getTime()) / HOUR_MS);
  return (engagementOf(post) + 1) / (ageHours + 2) ** 1.5;
};

const candidateSelect = {
  id: true,
  userId: true,
  category: true,
  createdAt: true,
  likes: true,
  unlikes: true,
  _count: { select: { comment: true, savedPosts: true } },
};

// ---------------------------------------------------------------------------
// "For you" feed
// ---------------------------------------------------------------------------

const FEED_WEIGHTS = { author: 0.35, topic: 0.3, popularity: 0.25, fresh: 0.1 };

/**
 * Greedy re-rank for variety: never more than 2 posts in a row from one author,
 * and no more than 3 in a row from one topic, unless nothing else is left.
 */
const diversify = (scored) => {
  const pool = [...scored];
  const result = [];
  while (pool.length) {
    const recent = result.slice(-3);
    const lastTwoAuthors = recent.slice(-2).map((item) => item.userId);
    const index = pool.findIndex((item) => {
      const authorRun =
        lastTwoAuthors.length === 2 && lastTwoAuthors.every((id) => id === item.userId);
      const topicRun = recent.length === 3 && recent.every((r) => r.category === item.category);
      return !authorRun && !topicRun;
    });
    result.push(pool.splice(index === -1 ? 0 : index, 1)[0]);
  }
  return result;
};

const buildFeed = async (userId) => {
  const profile = await getProfile(userId);
  const now = Date.now();
  const favourite = topTopics(profile, 5);
  const followed = [...profile.following];
  const since = (days) => new Date(now - days * DAY_MS);

  const [fromFollowed, fromTopics, popular] = await Promise.all([
    followed.length
      ? prisma.posts.findMany({
          where: { userId: { in: followed }, createdAt: { gte: since(90) } },
          select: candidateSelect,
          orderBy: { createdAt: "desc" },
          take: 150,
        })
      : [],
    favourite.length
      ? prisma.posts.findMany({
          where: { category: { in: favourite }, createdAt: { gte: since(60) } },
          select: candidateSelect,
          orderBy: { likes: "desc" },
          take: 150,
        })
      : [],
    prisma.posts.findMany({
      where: { createdAt: { gte: since(30) } },
      select: candidateSelect,
      orderBy: { likes: "desc" },
      take: 80,
    }),
  ]);

  // Quiet community or brand-new account: fall back to the best posts of all time.
  let candidates = [...fromFollowed, ...fromTopics, ...popular];
  if (candidates.length < 20) {
    const evergreen = await prisma.posts.findMany({
      select: candidateSelect,
      orderBy: { likes: "desc" },
      take: 100,
    });
    candidates = [...candidates, ...evergreen];
  }

  const unique = new Map();
  for (const post of candidates) {
    if (post.userId === userId || profile.excluded.has(post.id)) continue;
    unique.set(post.id, post);
  }
  const posts = [...unique.values()];
  if (!posts.length) return [];

  const authorScore = normalizer(profile.authors);
  const topicScore = normalizer(profile.topics);
  const hot = new Map(posts.map((post) => [post.id, Math.log1p(hotness(post, now) * 100)]));
  const popularityScore = normalizer(hot);

  const scored = posts.map((post) => {
    const parts = {
      author: authorScore(post.userId),
      topic: topicScore(post.category),
      popularity: popularityScore(post.id),
      fresh: decay(post.createdAt, now),
    };
    let score = Object.entries(FEED_WEIGHTS).reduce(
      (sum, [key, weight]) => sum + weight * parts[key],
      0
    );
    if (profile.seen.has(post.id)) score *= 0.5; // already engaged with it

    let reason;
    if (profile.following.has(post.userId)) reason = { type: "following" };
    else if (parts.topic >= 0.4) reason = { type: "topic", topic: post.category };
    else if (parts.author > 0) reason = { type: "author" };
    else reason = { type: "popular" };

    return { id: post.id, userId: post.userId, category: post.category, score, reason };
  });

  scored.sort((a, b) => b.score - a.score);
  return diversify(scored.slice(0, MAX_FEED)).map(({ id, reason }) => ({ id, reason }));
};

/** Ranked ids for one page. Page 1 rebuilds; later pages reuse the same order. */
const feedPage = async (userId, { page, limit }) => {
  let ranked = null;
  if (page > 1) {
    const cached = await getValue(feedKey(userId));
    if (cached) {
      try {
        ranked = JSON.parse(cached);
      } catch {
        ranked = null;
      }
    }
  }
  if (!ranked) {
    ranked = await buildFeed(userId);
    await setValue(feedKey(userId), JSON.stringify(ranked), FEED_TTL_MS);
  }
  const start = (page - 1) * limit;
  return { items: ranked.slice(start, start + limit), total: ranked.length };
};

// ---------------------------------------------------------------------------
// Who to follow
// ---------------------------------------------------------------------------

const suggestPeople = async (userId, limit = 5) => {
  const profile = await getProfile(userId);
  const followed = [...profile.following];
  const skip = new Set([userId, ...followed]);
  const favourite = topTopics(profile, 5);
  const scores = new Map();
  const reasons = new Map();

  const bump = (id, amount, reason, priority) => {
    if (skip.has(id)) return;
    addTo(scores, id, amount);
    const current = reasons.get(id);
    if (!current || priority > current.priority) reasons.set(id, { ...reason, priority });
  };

  const [friendsOfFriends, followers, topicWriters, popular] = await Promise.all([
    followed.length
      ? prisma.follows.findMany({
          where: { followerId: { in: followed } },
          select: { followerId: true, followingId: true },
          take: 2000,
        })
      : [],
    prisma.follows.findMany({ where: { followingId: userId }, select: { followerId: true } }),
    favourite.length
      ? prisma.posts.groupBy({
          by: ["userId", "category"],
          where: {
            category: { in: favourite },
            createdAt: { gte: new Date(Date.now() - 180 * DAY_MS) },
          },
          _count: { _all: true },
          _sum: { likes: true },
        })
      : [],
    prisma.follows.groupBy({
      by: ["followingId"],
      _count: { _all: true },
      orderBy: { _count: { followingId: "desc" } },
      take: 30,
    }),
  ]);

  // 1. Followed by people you follow.
  const viaFriends = new Map();
  for (const row of friendsOfFriends) {
    if (skip.has(row.followingId)) continue;
    const list = viaFriends.get(row.followingId) || [];
    list.push(row.followerId);
    viaFriends.set(row.followingId, list);
  }
  for (const [id, via] of viaFriends) {
    bump(id, 3 * Math.min(via.length, 5), { type: "mutual", via }, 3);
  }

  // 2. Follows you, but you don't follow back.
  for (const row of followers) bump(row.followerId, 4, { type: "followsYou" }, 4);

  // 3. Active writers in your favourite topics.
  const topicScore = normalizer(profile.topics);
  for (const row of topicWriters) {
    if (!row.userId) continue;
    const activity = Math.min(row._count._all, 5) / 5 + Math.min(row._sum.likes || 0, 50) / 100;
    bump(
      row.userId,
      2.5 * activity * topicScore(row.category),
      { type: "topic", topic: row.category },
      2
    );
  }

  // 4. Popular writers (also covers brand-new accounts).
  const maxFollowers = Math.max(1, ...popular.map((row) => row._count._all));
  for (const row of popular) {
    bump(row.followingId, row._count._all / maxFollowers, { type: "popular" }, 1);
  }

  const rankedIds = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .slice(0, limit * 3);
  if (!rankedIds.length) return [];

  const users = await prisma.user.findMany({
    where: { id: { in: rankedIds }, verified: true },
    select: { id: true, username: true, fullname: true, avatar: true },
  });
  const byId = new Map(users.map((user) => [user.id, user]));

  const viaIds = [...new Set(rankedIds.flatMap((id) => reasons.get(id)?.via?.slice(0, 1) || []))];
  const viaUsers = viaIds.length
    ? await prisma.user.findMany({
        where: { id: { in: viaIds } },
        select: { id: true, username: true, fullname: true },
      })
    : [];
  const viaName = new Map(viaUsers.map((user) => [user.id, user.fullname || user.username]));

  return rankedIds
    .filter((id) => byId.has(id))
    .slice(0, limit)
    .map((id) => {
      const { type, via, topic } = reasons.get(id);
      let reason = "Popular writer";
      if (type === "followsYou") reason = "Follows you";
      if (type === "topic") reason = `Writes about ${topicLabel(topic)}`;
      if (type === "mutual") {
        const name = viaName.get(via[0]) || "someone you follow";
        reason =
          via.length > 1 ? `Followed by ${name} and ${via.length - 1} more` : `Followed by ${name}`;
      }
      return { ...byId.get(id), reason };
    });
};

// ---------------------------------------------------------------------------
// Trending topics: activity this week compared with the usual week.
// ---------------------------------------------------------------------------

const RECENT_DAYS = 7;
const BASELINE_DAYS = 28;

const loadTrending = async () => {
  const now = Date.now();
  const recentStart = new Date(now - RECENT_DAYS * DAY_MS);
  const baselineStart = new Date(now - (RECENT_DAYS + BASELINE_DAYS) * DAY_MS);

  const [posts, comments, allTime] = await Promise.all([
    prisma.posts.findMany({
      where: { createdAt: { gte: baselineStart } },
      select: {
        category: true,
        createdAt: true,
        likes: true,
        _count: { select: { savedPosts: true } },
      },
    }),
    prisma.comment.findMany({
      where: { createdAt: { gte: baselineStart } },
      select: { createdAt: true, post: { select: { category: true } } },
    }),
    prisma.posts.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);

  const recent = new Map();
  const baseline = new Map();
  const recentPosts = new Map();
  const add = (date, category, amount) => {
    if (!category) return;
    if (new Date(date) >= recentStart) addTo(recent, category, amount);
    else addTo(baseline, category, amount);
  };
  for (const post of posts) {
    add(post.createdAt, post.category, 3 + (post.likes || 0) + 3 * (post._count?.savedPosts || 0));
    if (new Date(post.createdAt) >= recentStart) addTo(recentPosts, post.category, 1);
  }
  for (const comment of comments) add(comment.createdAt, comment.post?.category, 2);

  const totals = new Map(allTime.map((row) => [row.category, row._count._all]));
  const weeks = BASELINE_DAYS / RECENT_DAYS;

  const topics = Object.values(Category).map((name) => {
    const now7 = recent.get(name) || 0;
    const usual = (baseline.get(name) || 0) / weeks;
    const growth = usual > 0 ? (now7 - usual) / usual : now7 > 0 ? 1 : 0;
    // Momentum rewards both volume and a jump above the topic's normal level.
    const score = now7 > 0 ? Math.log1p(now7) * ((now7 + 1) / (usual + 1)) : 0;
    return {
      name,
      count: totals.get(name) || 0,
      postsThisWeek: recentPosts.get(name) || 0,
      growth: Math.round(growth * 100),
      score,
    };
  });

  const active = topics.filter((topic) => topic.score > 0);
  // Quiet week: fall back to the biggest topics so the widget is never empty.
  const ranked = active.length
    ? active.sort((a, b) => b.score - a.score)
    : topics.filter((topic) => topic.count > 0).sort((a, b) => b.count - a.count);

  return { topics: ranked, basis: active.length ? "week" : "allTime" };
};

const trendingTopics = () => remember("reco:trending", TRENDING_TTL_MS, loadTrending);

// ---------------------------------------------------------------------------
// Related posts: "readers also liked", then same topic, then same author.
// ---------------------------------------------------------------------------

const relatedPosts = async (postId, viewerId, limit = 5) => {
  const post = await prisma.posts.findUnique({ where: { id: postId }, select: postSelect });
  if (!post) return null;

  const [likers, savers] = await Promise.all([
    prisma.like.findMany({ where: { postId }, select: { userId: true }, take: 200 }),
    prisma.savedPosts.findMany({ where: { postId }, select: { userId: true }, take: 200 }),
  ]);
  const readers = [...new Set([...likers, ...savers].map((row) => row.userId).filter(Boolean))];

  const [alsoLiked, alsoSaved, sameTopic, sameAuthor] = await Promise.all([
    readers.length
      ? prisma.like.findMany({
          where: { userId: { in: readers }, postId: { not: postId } },
          select: { postId: true },
          take: 2000,
        })
      : [],
    readers.length
      ? prisma.savedPosts.findMany({
          where: { userId: { in: readers }, postId: { not: postId } },
          select: { postId: true },
          take: 2000,
        })
      : [],
    prisma.posts.findMany({
      where: { category: post.category, id: { not: postId } },
      select: candidateSelect,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    post.userId
      ? prisma.posts.findMany({
          where: { userId: post.userId, id: { not: postId } },
          select: candidateSelect,
          orderBy: { createdAt: "desc" },
          take: 10,
        })
      : [],
  ]);

  const scores = new Map();
  const reasons = new Map();
  const bump = (id, amount, reason, priority) => {
    addTo(scores, id, amount);
    const current = reasons.get(id);
    if (!current || priority > current.priority) reasons.set(id, { reason, priority });
  };

  for (const row of alsoLiked) bump(row.postId, 3, "co", 3);
  for (const row of alsoSaved) bump(row.postId, 4, "co", 3);

  const now = Date.now();
  const hot = new Map(
    [...sameTopic, ...sameAuthor].map((item) => [item.id, Math.log1p(hotness(item, now) * 100)])
  );
  const hotScore = normalizer(hot);
  for (const item of sameTopic) bump(item.id, 1 + hotScore(item.id), "topic", 2);
  for (const item of sameAuthor) bump(item.id, 0.75 + hotScore(item.id) * 0.5, "author", 1);

  if (viewerId) {
    const disliked = await prisma.unlike.findMany({
      where: { userId: viewerId, postId: { in: [...scores.keys()] } },
      select: { postId: true },
    });
    for (const row of disliked) scores.delete(row.postId);
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => ({ id, reason: reasons.get(id).reason }));
  return { post, ranked };
};

module.exports = {
  forgetUser,
  getProfile,
  topTopics,
  feedPage,
  suggestPeople,
  trendingTopics,
  relatedPosts,
  topicLabel,
  // exported for tests
  hotness,
  diversify,
  decay,
};
