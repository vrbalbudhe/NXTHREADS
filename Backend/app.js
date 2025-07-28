const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());

app.use("/api/auth", require("./Routes/Auth.Routes"));
app.use("/api/post", require("./Routes/Post.Routes"));
app.use("/api/user", require("./Routes/User.Routes"));
app.use("/api/userfollow", require("./Routes/Follow.Routes"));
app.use("/api/comment", require("./Routes/Comment.Routes"));
app.use("/api/chat", require("./Routes/Chat.Routes"));

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
