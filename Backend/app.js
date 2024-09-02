const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  transports: ["websocket"],
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
  },
  allowEIO3: true,
});

// Import routes
const authRoutes = require("./Routes/Auth.Routes");
const postRoutes = require("./Routes/Post.Routes");
const userRoutes = require("./Routes/User.Routes");
const followRoutes = require("./Routes/Follow.Routes");
const commentRoutes = require("./Routes/Comment.Routes");

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/user", userRoutes);
app.use("/api/userfollow", followRoutes);
app.use("/api/comment", commentRoutes);

app.set("socketio",io);

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


const port = 8000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
