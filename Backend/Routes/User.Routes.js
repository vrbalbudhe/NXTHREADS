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

router.get("/", getUsers);
router.get("/:id", getUser);
router.get("/foll/:id", verifyToken, getUserFollowStatus);
router.delete("/:id", verifyToken, deleteUser);
router.post("/:id", verifyToken, updateUser);

module.exports = router;
