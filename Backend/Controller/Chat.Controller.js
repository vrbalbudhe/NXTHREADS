const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { isObjectId, cleanString, invalidId } = require("../lib/validators");

const MAX_MESSAGE_LENGTH = 2000;

const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.follows.findMany({
    where: { followerId: req.userId },
    include: { following: { select: publicUserSelect } },
  });
  return res.status(200).json({ users });
});

const sendMessage = asyncHandler(async (req, res) => {
  const senderId = req.userId;
  const receiverId = req.body?.receiverId;
  const content = cleanString(req.body?.content);

  if (!isObjectId(receiverId) || receiverId === senderId) {
    return invalidId(res, "receiver id");
  }
  if (!content || content.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Message must be 1-${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
    select: { id: true },
  });
  if (!receiver) {
    return res.status(404).json({ success: false, message: "Receiver not found" });
  }

  let chat = await prisma.chat.findFirst({
    where: { participants: { hasEvery: [senderId, receiverId] } },
  });

  if (!chat) {
    chat = await prisma.chat.create({ data: { participants: [senderId, receiverId] } });
  }

  const message = await prisma.message.create({
    data: { senderId, receiverId, content, chatId: chat.id },
  });

  await prisma.chat.update({ where: { id: chat.id }, data: { lastMessage: content } });

  return res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

const receiveMessage = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.body?.receiverId;

  if (!isObjectId(otherUserId)) {
    return invalidId(res, "receiver id");
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({
    success: true,
    message: "Messages fetched successfully",
    data: messages,
  });
});

module.exports = {
  getUsers,
  sendMessage,
  receiveMessage,
};
