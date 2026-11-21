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

router.get("/", verifyToken, getUsers);
router.get("/:id", verifyToken, getUser);
router.get("/foll/:id", verifyToken, getUserFollowStatus);
router.delete("/:id", verifyToken, deleteUser);
router.put("/upd/:id", verifyToken, updateUser);

module.exports = router;
