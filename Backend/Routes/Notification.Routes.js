const express = require("express");
const router = express.Router();

const {
  listNotifications,
  getUnreadCount,
  markRead,
} = require("../Controller/Notification.Controller");
const verifyToken = require("../Middleware/verifyToken");
const validate = require("../Middleware/validate");
const schemas = require("../lib/schemas");

router.use(verifyToken);

router.get("/", validate({ query: schemas.notification.list }), listNotifications);
router.get("/unread-count", getUnreadCount);
router.post("/read", validate({ body: schemas.notification.markRead }), markRead);

module.exports = router;
