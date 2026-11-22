require("dotenv").config();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const data = require("./seed-data");

const prisma = new PrismaClient();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const LEGACY_TEST_DOMAINS = ["@example.test"];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const removeUsers = async (userIds) => {
  if (userIds.length === 0) return;
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { email: true },
  });
  const posts = await prisma.posts.findMany({
    where: { userId: { in: userIds } },
    select: { id: true },
  });
  const postIds = posts.map((post) => post.id);
  const byUserOrPost = (userField) => ({
    OR: [{ [userField]: { in: userIds } }, { postId: { in: postIds } }],
  });
  const chats = await prisma.chat.findMany({
    where: { participants: { hasSome: userIds } },
    select: { id: true },
  });

  await prisma.notification.deleteMany({
    where: {
      OR: [{ userId: { in: userIds } }, { actorId: { in: userIds } }, { postId: { in: postIds } }],
    },
  });
  await prisma.comment.deleteMany({ where: byUserOrPost("commentor") });
  await prisma.like.deleteMany({ where: byUserOrPost("userId") });
  await prisma.unlike.deleteMany({ where: byUserOrPost("userId") });
  await prisma.savedPosts.deleteMany({ where: byUserOrPost("userId") });
  await prisma.posts.deleteMany({ where: { id: { in: postIds } } });
  await prisma.follows.deleteMany({
    where: { OR: [{ followerId: { in: userIds } }, { followingId: { in: userIds } }] },
  });
  await prisma.message.deleteMany({
    where: { OR: [{ senderId: { in: userIds } }, { receiverId: { in: userIds } }] },
  });
  await prisma.chat.deleteMany({ where: { id: { in: chats.map((chat) => chat.id) } } });
  await prisma.verificationCode.deleteMany({ where: { email: { in: users.map((user) => user.email) } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
};

const resetDemoData = async () => {
  const domains = [`@${data.DEMO_DOMAIN}`, ...LEGACY_TEST_DOMAINS];
  const existing = await prisma.user.findMany({
    where: { OR: domains.map((domain) => ({ email: { endsWith: domain } })) },
    select: { id: true },
  });
  await removeUsers(existing.map((user) => user.id));
  return existing.length;
};

const at = (msAgo) => new Date(Date.now() - msAgo);

const seed = async (password) => {
  const hash = await bcrypt.hash(password, 10);
  const users = {};
  for (const [index, user] of data.users.entries()) {
    users[user.key] = await prisma.user.create({
      data: {
        username: user.username,
        fullname: user.fullname,
        gender: user.gender,
        avatar: user.avatar,
        email: `${user.username}@${data.DEMO_DOMAIN}`,
        password: hash,
        verified: true,
        createdAt: at((40 + index * 3) * DAY),
      },
    });
  }

  const posts = {};
  for (const [index, post] of data.posts.entries()) {
    const author = users[post.author];
    posts[post.key] = await prisma.posts.create({
      data: {
        title: post.title,
        subtitle: post.subtitle,
        category: post.category,
        content: post.content,
        images: post.images,
        author: author.username,
        userId: author.id,
        createdAt: at(post.daysAgo * DAY + (index % 5) * 2 * HOUR + 30 * 60 * 1000),
      },
    });
  }

  const notifications = [];
  const notifyAt = (createdAt) => ({ createdAt, read: Date.now() - createdAt.getTime() > 2 * DAY });

  for (const comment of data.comments) {
    const post = posts[comment.post];
    const author = users[comment.author];
    const createdAt = new Date(post.createdAt.getTime() + comment.hoursAfter * HOUR);
    const created = await prisma.comment.create({
      data: { postId: post.id, commentor: author.id, description: comment.text, createdAt },
    });
    if (post.userId !== author.id) {
      notifications.push({
        type: "COMMENT",
        userId: post.userId,
        actorId: author.id,
        postId: post.id,
        commentId: created.id,
        preview: comment.text.slice(0, 140),
        ...notifyAt(createdAt),
      });
    }
  }

  for (const [index, [from, to]] of data.follows.entries()) {
    await prisma.follows.create({
      data: { followerId: users[from].id, followingId: users[to].id },
    });
    notifications.push({
      type: "FOLLOW",
      userId: users[to].id,
      actorId: users[from].id,
      ...notifyAt(at((index % 9) * 9 * HOUR + HOUR)),
    });
  }

  const likeCounts = {};
  for (const [index, [who, postKey]] of data.likes.entries()) {
    const post = posts[postKey];
    await prisma.like.create({ data: { userId: users[who].id, postId: post.id } });
    likeCounts[postKey] = (likeCounts[postKey] || 0) + 1;
    if (post.userId !== users[who].id) {
      const createdAt = new Date(
        Math.min(
          Date.now() - 10 * 60 * 1000,
          post.createdAt.getTime() + ((index % 7) + 1) * 2 * HOUR
        )
      );
      notifications.push({
        type: "LIKE",
        userId: post.userId,
        actorId: users[who].id,
        postId: post.id,
        preview: post.title,
        ...notifyAt(createdAt),
      });
    }
  }
  for (const [postKey, count] of Object.entries(likeCounts)) {
    await prisma.posts.update({ where: { id: posts[postKey].id }, data: { likes: count } });
  }

  for (const [who, postKey] of data.saves) {
    await prisma.savedPosts.create({ data: { userId: users[who].id, postId: posts[postKey].id } });
  }

  for (const conversation of data.conversations) {
    const [first, second] = conversation.between.map((key) => users[key]);
    const last = conversation.messages[conversation.messages.length - 1];
    const chat = await prisma.chat.create({
      data: { participants: [first.id, second.id], lastMessage: last.text },
    });
    for (const message of conversation.messages) {
      const sender = users[message.from];
      const receiver = sender.id === first.id ? second : first;
      await prisma.message.create({
        data: {
          chatId: chat.id,
          senderId: sender.id,
          receiverId: receiver.id,
          content: message.text,
          createdAt: at(message.minutesAgo * 60 * 1000),
          ...(message.minutesAgo > 120 && { readAt: at((message.minutesAgo - 5) * 60 * 1000) }),
        },
      });
    }
  }

  await prisma.notification.createMany({ data: notifications });

  return {
    users: Object.keys(users).length,
    posts: Object.keys(posts).length,
    comments: data.comments.length,
    follows: data.follows.length,
    likes: data.likes.length,
    saves: data.saves.length,
    conversations: data.conversations.length,
    notifications: notifications.length,
  };
};

const main = async () => {
  if (process.env.NODE_ENV === "production") {
    fail("Refusing to seed demo data in production.");
  }
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    fail("Set SEED_PASSWORD (at least 8 characters) to the password the demo accounts should use.");
  }

  const removed = await resetDemoData();
  const summary = await seed(password);

  process.stdout.write(`Removed ${removed} previous demo or test accounts\n`);
  process.stdout.write(`Seeded ${JSON.stringify(summary)}\n`);
  process.stdout.write(
    `Sign in with any of: ${data.users.map((user) => `${user.username}@${data.DEMO_DOMAIN}`).join(", ")}\n`
  );
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
