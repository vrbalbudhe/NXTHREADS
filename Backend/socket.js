const { Server } = require("socket.io");
const { frontendUrl } = require("./Config/env");
const { verifySessionToken } = require("./Middleware/verifyToken");
const {
  ChatError,
  sendMessage,
  markConversationRead,
  userRoom,
} = require("./lib/chatService");

const MESSAGE_WINDOW_MS = 10 * 1000;
const MAX_MESSAGES_PER_WINDOW = 20;

const readCookie = (header, name) => {
  if (typeof header !== "string") {
    return null;
  }
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) {
      continue;
    }
    if (part.slice(0, index).trim() === name) {
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
};

const isSessionExpired = (session) =>
  typeof session.exp === "number" && session.exp * 1000 <= Date.now();

const allowMessage = (socket) => {
  const now = Date.now();
  const bucket = socket.data.rate;
  if (!bucket || bucket.resetAt <= now) {
    socket.data.rate = { count: 1, resetAt: now + MESSAGE_WINDOW_MS };
    return true;
  }
  bucket.count += 1;
  return bucket.count <= MAX_MESSAGES_PER_WINDOW;
};

const attachSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: frontendUrl, credentials: true },
    maxHttpBufferSize: 16 * 1024,
  });

  io.use((socket, next) => {
    const token = readCookie(socket.handshake.headers.cookie, "token");
    const session = verifySessionToken(token);
    if (!session) {
      return next(new Error("Authentication required"));
    }
    socket.data.session = session;
    return next();
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data.session;
    socket.join(userRoom(userId));

    socket.on("chat:send", async (payload, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};

      if (isSessionExpired(socket.data.session)) {
        reply({ success: false, message: "Session expired" });
        socket.disconnect(true);
        return;
      }
      if (!allowMessage(socket)) {
        reply({ success: false, message: "You are sending messages too quickly" });
        return;
      }

      try {
        const message = await sendMessage(userId, payload);
        io.to(userRoom(message.senderId))
          .to(userRoom(message.receiverId))
          .emit("chat:message", message);
        reply({ success: true, data: message });
      } catch (error) {
        if (error instanceof ChatError) {
          reply({ success: false, message: error.message });
          return;
        }
        console.error(error);
        reply({ success: false, message: "Unable to send message" });
      }
    });

    socket.on("chat:read", async (payload) => {
      if (isSessionExpired(socket.data.session)) {
        socket.disconnect(true);
        return;
      }
      if (!allowMessage(socket)) {
        return;
      }
      try {
        await markConversationRead(userId, payload?.userId);
      } catch (error) {
        if (!(error instanceof ChatError)) {
          console.error(error);
        }
      }
    });
  });

  return io;
};

module.exports = { attachSocket };
