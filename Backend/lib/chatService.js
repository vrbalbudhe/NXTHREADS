const prisma = require("./prisma");
const { publicUserSelect } = require("./selects");
const { chat: schemas, objectId, firstIssueMessage } = require("./schemas");

const HISTORY_PAGE_SIZE = 50;
const isObjectId = (value) => objectId().safeParse(value).success;

class ChatError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const unreadFilter = { OR: [{ readAt: null }, { readAt: { isSet: false } }] };

const pairFilter = (userId, otherUserId) => ({
  OR: [
    { senderId: userId, receiverId: otherUserId },
    { senderId: otherUserId, receiverId: userId },
  ],
});

const findChat = (userId, otherUserId) =>
  prisma.chat.findFirst({
    where: { participants: { hasEvery: [userId, otherUserId] } },
  });

const canMessage = async (senderId, receiverId) => {
  const follow = await prisma.follows.findFirst({
    where: {
      OR: [
        { followerId: senderId, followingId: receiverId },
        { followerId: receiverId, followingId: senderId },
      ],
    },
    select: { id: true },
  });
  if (follow) {
    return true;
  }
  return Boolean(await findChat(senderId, receiverId));
};

const parseOrThrow = (schema, value) => {
  const result = schema.safeParse(value ?? {});
  if (!result.success) {
    throw new ChatError(400, firstIssueMessage(result.error));
  }
  return result.data;
};

const sendMessage = async (senderId, payload) => {
  const { receiverId, content } = parseOrThrow(schemas.message, payload);
  if (receiverId === senderId) {
    throw new ChatError(400, "Invalid receiver id");
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });
  if (!receiver) {
    throw new ChatError(404, "Receiver not found");
  }
  if (!(await canMessage(senderId, receiverId))) {
    throw new ChatError(403, "You can only message people you follow or who follow you");
  }

  const chat =
    (await findChat(senderId, receiverId)) ||
    (await prisma.chat.create({ data: { participants: [senderId, receiverId] } }));

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: { senderId, receiverId, content, chatId: chat.id },
    }),
    prisma.chat.update({ where: { id: chat.id }, data: { lastMessage: content } }),
  ]);

  return message;
};

const markConversationRead = async (userId, otherUserId) => {
  parseOrThrow(schemas.read, { userId: otherUserId });
  await prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, ...unreadFilter },
    data: { readAt: new Date() },
  });
};

const getHistory = async (userId, otherUserId, query) => {
  parseOrThrow(schemas.read, { userId: otherUserId });
  const { before } = parseOrThrow(schemas.history, query);

  const messages = await prisma.message.findMany({
    where: {
      ...pairFilter(userId, otherUserId),
      ...(before && { createdAt: { lt: new Date(before) } }),
    },
    orderBy: { createdAt: "desc" },
    take: HISTORY_PAGE_SIZE + 1,
  });

  const hasMore = messages.length > HISTORY_PAGE_SIZE;
  const page = messages.slice(0, HISTORY_PAGE_SIZE).reverse();

  await markConversationRead(userId, otherUserId);

  return { messages: page, hasMore };
};

const getContacts = async (userId) => {
  const [follows, chats, unread] = await Promise.all([
    prisma.follows.findMany({
      where: { OR: [{ followerId: userId }, { followingId: userId }] },
      select: { followerId: true, followingId: true },
    }),
    prisma.chat.findMany({
      where: { participants: { has: userId } },
      select: { participants: true, lastMessage: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: userId, ...unreadFilter },
      _count: { _all: true },
    }),
  ]);

  const chatByUser = new Map();
  for (const chat of chats) {
    const otherId = chat.participants.find((id) => id !== userId);
    if (otherId && !chatByUser.has(otherId)) {
      chatByUser.set(otherId, chat);
    }
  }

  const contactIds = new Set(chatByUser.keys());
  for (const follow of follows) {
    contactIds.add(follow.followerId === userId ? follow.followingId : follow.followerId);
  }
  contactIds.delete(userId);

  const unreadByUser = new Map(unread.map((row) => [row.senderId, row._count._all]));

  const users = await prisma.user.findMany({
    where: { id: { in: [...contactIds].filter(isObjectId) } },
    select: publicUserSelect,
  });

  return users
    .map((user) => {
      const chat = chatByUser.get(user.id);
      return {
        ...user,
        lastMessage: chat?.lastMessage || null,
        lastMessageAt: chat?.updatedAt || null,
        unreadCount: unreadByUser.get(user.id) || 0,
      };
    })
    .sort((a, b) => {
      const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return (a.username || "").localeCompare(b.username || "");
    });
};

const userRoom = (userId) => `user:${userId}`;

module.exports = {
  ChatError,
  sendMessage,
  getHistory,
  getContacts,
  markConversationRead,
  userRoom,
};
