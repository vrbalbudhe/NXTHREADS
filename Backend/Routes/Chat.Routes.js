const express = require("express");
const router = express.Router();

const {
  listContacts,
  listMessages,
  createMessage,
} = require("../Controller/Chat.Controller");
const verifyToken = require("../Middleware/verifyToken");
const createRateLimiter = require("../Middleware/rateLimit");

const sendLimiter = createRateLimiter({
  windowMs: 10 * 1000,
  max: 20,
  message: "You are sending messages too quickly",
});

router.use(verifyToken);

router.get("/contacts", listContacts);
router.get("/messages/:userId", listMessages);
router.post("/messages", sendLimiter, createMessage);

module.exports = router;
