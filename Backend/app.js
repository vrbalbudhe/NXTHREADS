const config = require("./Config/env");
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const prisma = require("./lib/prisma");
const { attachSocket } = require("./socket");
const { connectRedis, disconnectRedis } = require("./lib/redis");

const app = express();

app.disable("x-powered-by");
app.use(helmet());

if (config.trustProxy) {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: config.frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.use("/api/auth", require("./Routes/Auth.Routes"));
app.use("/api/post", require("./Routes/Post.Routes"));
app.use("/api/user", require("./Routes/User.Routes"));
app.use("/api/userfollow", require("./Routes/Follow.Routes"));
app.use("/api/comment", require("./Routes/Comment.Routes"));
app.use("/api/chat", require("./Routes/Chat.Routes"));
app.use("/api/notifications", require("./Routes/Notification.Routes"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Malformed JSON body" });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body too large" });
  }
  console.error(err);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const server = http.createServer(app);

const start = async () => {
  await connectRedis();
  await attachSocket(server);
  server.listen(config.port, () => {
    process.stdout.write(`Server running on port ${config.port}\n`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});

const shutdown = () => {
  server.close(async () => {
    await Promise.allSettled([prisma.$disconnect(), disconnectRedis()]);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
