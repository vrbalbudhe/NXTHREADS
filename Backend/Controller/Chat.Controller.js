const asyncHandler = require("express-async-handler");
const { ChatError, sendMessage, getHistory, getContacts } = require("../lib/chatService");
const { emitToUser } = require("../lib/realtime");

const handleChatError = (res, error) => {
  if (error instanceof ChatError) {
    return res.status(error.status).json({ success: false, message: error.message });
  }
  throw error;
};

const listContacts = asyncHandler(async (req, res) => {
  const contacts = await getContacts(req.userId);
  return res.status(200).json({ success: true, data: contacts });
});

const listMessages = asyncHandler(async (req, res) => {
  try {
    const { messages, hasMore } = await getHistory(req.userId, req.params.userId, req.query);
    return res.status(200).json({ success: true, data: messages, hasMore });
  } catch (error) {
    return handleChatError(res, error);
  }
});

const createMessage = asyncHandler(async (req, res) => {
  try {
    const message = await sendMessage(req.userId, req.body);
    emitToUser(message.senderId, "chat:message", message);
    emitToUser(message.receiverId, "chat:message", message);
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return handleChatError(res, error);
  }
});

module.exports = {
  listContacts,
  listMessages,
  createMessage,
};
