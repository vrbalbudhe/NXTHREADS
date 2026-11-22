const asyncHandler = require("express-async-handler");
const { Category } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { postIncludeFor, shapePost } = require("../lib/selects");
const { containsText } = require("../lib/text");
const { remember, removeKeys } = require("../lib/store");

const categories = new Set(Object.values(Category));
const TREND_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const pageMeta = ({ page, limit }, count, total) => ({
  total,
  page,
  limit,
  hasMore: (page - 1) * limit + count < total,
});

const findPaged = async (where, paging, viewerId) => {
  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      include: postIncludeFor(viewerId),
      orderBy: { createdAt: "desc" },
      skip: (paging.page - 1) * paging.limit,
      take: paging.limit,
    }),
    prisma.posts.count({ where }),
  ]);
  return { posts: posts.map(shapePost), meta: pageMeta(paging, posts.length, total) };
};

const pagingOf = ({ page, limit }) => ({ page, limit });

const CACHE_TTL_MS = 30 * 1000;
const invalidateCommunityCache = () => removeKeys("cache:stats", "cache:categories");

const loadCategories = async () => {
  const grouped = await prisma.posts.groupBy({
    by: ["category"],
    _count: { _all: true },
  });
  const counts = new Map(grouped.map((row) => [row.category, row._count._all]));

  return {
    categories: Object.values(Category).map((name) => ({
      name,
      count: counts.get(name) || 0,
    })),
  };
};

const getCategories = asyncHandler(async (req, res) => {
  return res.status(200).json(await remember("cache:categories", CACHE_TTL_MS, loadCategories));
});

const loadStats = async () => {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const since = new Date(startOfToday.getTime() - (TREND_DAYS - 1) * DAY_MS);

  const [posts, writers, comments, recent] = await Promise.all([
    prisma.posts.count(),
    prisma.user.count({ where: { verified: true } }),
    prisma.comment.count(),
    prisma.posts.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
  ]);

  const trend = Array.from({ length: TREND_DAYS }, () => 0);
  for (const { createdAt } of recent) {
    const index = Math.floor((createdAt.getTime() - since.getTime()) / DAY_MS);
    if (index >= 0 && index < TREND_DAYS) {
      trend[index] += 1;
    }
  }

  return {
    posts,
    writers,
    comments,
    postsThisWeek: trend.slice(-7).reduce((sum, value) => sum + value, 0),
    trend,
  };
};

const getStats = asyncHandler(async (req, res) => {
  return res.status(200).json(await remember("cache:stats", CACHE_TTL_MS, loadStats));
});

const getPostUrl = asyncHandler(async (req, res) => {
  const { category, author } = req.valid.query;
  const where = {
    ...(categories.has(category) && { category }),
    ...(author && author !== "All" && { author }),
  };

  return res.status(200).json(await findPaged(where, pagingOf(req.valid.query), req.userId));
});

const searchPosts = asyncHandler(async (req, res) => {
  const contains = containsText(req.valid.query.q);
  const where = {
    OR: [{ title: contains }, { subtitle: contains }, { content: contains }, { author: contains }],
  };

  return res.status(200).json(await findPaged(where, pagingOf(req.valid.query), req.userId));
});

const getPost = asyncHandler(async (req, res) => {
  const where = { userId: req.valid.params.id };
  return res.status(200).json(await findPaged(where, pagingOf(req.valid.query), req.userId));
});

const getAllPosts = asyncHandler(async (req, res) => {
  return res.status(200).json(await findPaged({}, pagingOf(req.valid.query), req.userId));
});

const createPosts = asyncHandler(async (req, res) => {
  const { title, subtitle, content, category, images } = req.valid.body;

  const newPost = await prisma.posts.create({
    data: {
      title,
      subtitle,
      category,
      content,
      images,
      author: req.session?.username || "",
      userId: req.userId,
    },
    include: postIncludeFor(req.userId),
  });
  await invalidateCommunityCache();

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    post: shapePost(newPost),
  });
});

const findOwnedPost = async (req, res) => {
  const post = await prisma.posts.findUnique({ where: { id: req.valid.params.id } });
  if (!post) {
    res.status(404).json({ success: false, message: "Post not found" });
    return null;
  }
  if (post.userId !== req.userId) {
    res.status(403).json({ success: false, message: "You can only change your own posts" });
    return null;
  }
  return post;
};

const updatePost = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) {
    return undefined;
  }

  const { title, subtitle, content, category, images } = req.valid.body;

  const updatedPost = await prisma.posts.update({
    where: { id: post.id },
    data: {
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(content && { content }),
      ...(category && { category }),
      ...(images && { images }),
    },
    include: postIncludeFor(req.userId),
  });
  if (category) await invalidateCommunityCache();

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: shapePost(updatedPost),
  });
});

const deletePosts = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) {
    return undefined;
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId: post.id } }),
    prisma.like.deleteMany({ where: { postId: post.id } }),
    prisma.unlike.deleteMany({ where: { postId: post.id } }),
    prisma.savedPosts.deleteMany({ where: { postId: post.id } }),
    prisma.notification.deleteMany({ where: { postId: post.id } }),
    prisma.posts.delete({ where: { id: post.id } }),
  ]);
  await invalidateCommunityCache();

  return res.status(200).json({ success: true, message: "Post deleted successfully" });
});

const favUnfavPost = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { postId } = req.valid.body;

  const post = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const key = { userId_postId: { userId, postId } };
  const existing = await prisma.savedPosts.findUnique({ where: key });

  if (existing) {
    await prisma.savedPosts.delete({ where: key });
    return res.status(200).json({ success: true, saved: false, message: "Removed from saved" });
  }

  await prisma.savedPosts.create({ data: { userId, postId } });
  return res.status(200).json({ success: true, saved: true, message: "Saved" });
});

const getFavoritePosts = asyncHandler(async (req, res) => {
  const { id } = req.valid.params;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "Saved posts are private" });
  }

  const saved = await prisma.savedPosts.findMany({
    where: { userId: id },
    select: { postId: true },
  });
  const where = { id: { in: saved.map((entry) => entry.postId) } };

  return res.status(200).json(await findPaged(where, pagingOf(req.valid.query), req.userId));
});

const getFollowersPost = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const followedUsers = await prisma.follows.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const where = {
    userId: { in: [...followedUsers.map((follow) => follow.followingId), userId] },
  };

  return res.status(200).json(await findPaged(where, pagingOf(req.valid.query), userId));
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await prisma.posts.findUnique({
    where: { id: req.valid.params.id },
    include: postIncludeFor(req.userId),
  });

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  return res.status(200).json({ post: shapePost(post) });
});

module.exports = {
  getPost,
  getAllPosts,
  getPostById,
  deletePosts,
  updatePost,
  createPosts,
  getPostUrl,
  getCategories,
  getStats,
  searchPosts,
  favUnfavPost,
  getFollowersPost,
  getFavoritePosts,
};
