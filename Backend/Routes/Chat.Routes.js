const express = require("express");
const router = express.Router();

const {
  getUsers,
  sendMessage,
  receiveMessage,
} = require("../Controller/Chat.Controller");
const verifyToken = require("../Middleware/verifyToken");

router.use(verifyToken);

router.post("/getUsr", getUsers);
router.post("/send", sendMessage);
router.post("/receive", receiveMessage);

module.exports = router;
