const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { frontendUrl } = require("./Config/env");
const { verifySessionToken } = require("./lib/session");
const { getRedis } = require("./lib/redis");
const { setIo, userRoom } = require("./lib/realtime");
const { markOnline, markOffline, HEARTBEAT_MS } = require("./lib/presence");
const { chat: chatSchemas } = require("./lib/schemas");
const { ChatError, sendMessage, markConversationRead, contactIdsOf } = require("./lib/chatService");

const MESSAGE_WINDOW_MS = 10 * 1000;
const MAX_MESSAGES_PER_WINDOW = 20;
const MAX_TYPING_PER_WINDOW = 40;

const readCookie = (header, name) => {
  if (typeof header !== "string") return null;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
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

const allow = (socket, bucketName, max) => {
  const now = Date.now();
  const buckets = socket.data.buckets || (socket.data.buckets = {});
  const bucket = buckets[bucketName];
  if (!bucket || bucket.resetAt <= now) {
    buckets[bucketName] = { count: 1, resetAt: now + MESSAGE_WINDOW_MS };
    return true;
  }
  bucket.count += 1;
  return bucket.count <= max;
};

const sessionExpired = (session) =>
  typeof session.exp === "number" && session.exp * 1000 <= Date.now();

const attachAdapter = async (io) => {
  const redis = getRedis();
  if (!redis) return;
  const pub = redis.duplicate();
  const sub = redis.duplicate();
  pub.on("error", (error) => console.error(`Redis adapter error: ${error.message}`));
  sub.on("error", (error) => console.error(`Redis adapter error: ${error.message}`));
  await Promise.all([pub.connect(), sub.connect()]);
  io.adapter(createAdapter(pub, sub));
  process.stdout.write("Socket.IO using Redis adapter\n");
};

const broadcastPresence = (io, userId, contacts, online) => {
  for (const contactId of contacts) {
    io.to(userRoom(contactId)).emit("presence:update", { userId, online });
  }
};

const attachSocket = async (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: frontendUrl, credentials: true },
    maxHttpBufferSize: 16 * 1024,
  });

  try {
    await attachAdapter(io);
  } catch (error) {
    console.error(`Socket.IO Redis adapter unavailable (${error.message}), using memory adapter`);
  }

  io.use(async (socket, next) => {
    try {
      const token = readCookie(socket.handshake.headers.cookie, "token");
      const session = await verifySessionToken(token);
      if (!session) return next(new Error("Authentication required"));
      socket.data.session = session;
      return next();
    } catch {
      return next(new Error("Authentication required"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket.data.session;
    const room = userRoom(userId);
    socket.join(room);

    const contacts = new Set();
    const ready = (async () => {
      try {
        for (const id of await contactIdsOf(userId)) contacts.add(id);
        const wasOnline = (await io.in(room).fetchSockets()).length > 1;
        await markOnline(userId);
        if (!wasOnline) broadcastPresence(io, userId, contacts, true);
      } catch (error) {
        console.error(`Presence setup failed: ${error.message}`);
      }
    })();

    const heartbeat = setInterval(() => {
      if (sessionExpired(socket.data.session)) {
        socket.disconnect(true);
        return;
      }
      markOnline(userId).catch(() => {});
    }, HEARTBEAT_MS);

    socket.on("disconnect", async () => {
      clearInterval(heartbeat);
      await ready;
      try {
        const remaining = await io.in(room).fetchSockets();
        if (remaining.length === 0) {
          await markOffline(userId);
          broadcastPresence(io, userId, contacts, false);
        }
      } catch (error) {
        console.error(`Presence teardown failed: ${error.message}`);
      }
    });

    socket.on("chat:send", async (payload, ack) => {
      const reply = typeof ack === "function" ? ack : () => {};
      if (sessionExpired(socket.data.session)) {
        reply({ success: false, message: "Session expired" });
        socket.disconnect(true);
        return;
      }
      if (!allow(socket, "send", MAX_MESSAGES_PER_WINDOW)) {
        reply({ success: false, message: "You are sending messages too quickly" });
        return;
      }
      try {
        const message = await sendMessage(userId, payload);
        contacts.add(message.receiverId);
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
      if (!allow(socket, "read", MAX_MESSAGES_PER_WINDOW)) return;
      try {
        await markConversationRead(userId, payload?.userId);
      } catch (error) {
        if (!(error instanceof ChatError)) console.error(error);
      }
    });

    socket.on("chat:typing", async (payload) => {
      if (!allow(socket, "typing", MAX_TYPING_PER_WINDOW)) return;
      const parsed = chatSchemas.typing.safeParse(payload);
      if (!parsed.success) return;
      await ready;
      if (!contacts.has(parsed.data.userId)) return;
      io.to(userRoom(parsed.data.userId)).emit("chat:typing", {
        userId,
        typing: parsed.data.typing,
      });
    });
  });

  setIo(io);
  return io;
};

module.exports = { attachSocket };
