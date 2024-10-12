const prisma = require("../lib/prisma");

const getUsers = async (req, res) => {
  try {
    const { userId } = req.body;
    const users = await prisma.follows.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            avatar: true,
            fullname: true,
          },
        },
      },
    });
    return res.status(200).json({
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to get users (Chatting Routes)",
      success: false,
    });
  }
};

const sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  if (!senderId || !receiverId || !content) {
    return res.status(400).json({
      message: "Sender ID, Receiver ID, and content are required.",
      success: false,
    });
  }

  try {
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          hasEvery: [senderId, receiverId],
        },
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participants: [senderId, receiverId],
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        chatId: chat.id,
      },
    });

    // Emit message via Socket.IO to the recipient
    req.io.to(receiverId).emit("messageReceived", message);

    // Send response back to the client
    return res.status(201).json({
      message: "Message sent successfully!",
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending message: ", error);
    return res.status(500).json({
      message: "Unable to send message",
      success: false,
    });
  }
};

const receiveMessage = async (req, res) => {
  const { senderId, receiverId } = req.body;

  if (!senderId || !receiverId) {
    return res.status(400).json({
      message: "Sender ID and Receiver ID are required.",
      success: false,
    });
  }

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.status(200).json({
      message: "Messages fetched successfully!",
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error receiving messages: ", error);
    return res.status(500).json({
      message: "Unable to receive messages (Chatting Routes)",
      success: false,
    });
  }
};
module.exports = {
  getUsers,
  sendMessage,
  receiveMessage,
};
