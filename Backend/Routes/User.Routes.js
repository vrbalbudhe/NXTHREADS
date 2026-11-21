const express = require("express");
const router = express.Router();

const {
  getUser,
  getUsers,
  deleteUser,
  updateUser,
  getUserFollowStatus,
} = require("../Controller/User.Controller");
const verifyToken = require("../Middleware/verifyToken");
const createRateLimiter = require("../Middleware/rateLimit");

const passwordCheckLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Try again later",
});

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
router.get("/foll/:id", verifyToken, getUserFollowStatus);
router.delete("/:id", verifyToken, passwordCheckLimiter, deleteUser);
router.put("/upd/:id", verifyToken, passwordCheckLimiter, updateUser);

module.exports = router;
