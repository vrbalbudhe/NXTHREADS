const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./Config/socket");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

socketHandler(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

// io.on("connection", (socket) => {
//   // console.log("New client connected");

//   socket.emit("message", "welcome to the nexthreads");

//   socket.broadcast.emit("message", "A User has joined the chat");
//   socket.on("disconnect", () => {
//     // console.log("Client disconnected");
//   });
// });

app.use("/api/auth", require("./Routes/Auth.Routes"));
app.use("/api/post", require("./Routes/Post.Routes"));
app.use("/api/user", require("./Routes/User.Routes"));
app.use("/api/userfollow", require("./Routes/Follow.Routes"));
app.use("/api/comment", require("./Routes/Comment.Routes"));
app.use("/api/chat", require("./Routes/Chat.Routes"));

const port = 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
