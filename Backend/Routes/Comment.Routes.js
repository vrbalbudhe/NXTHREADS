const express = require("express");
const router = express.Router();

const {
  createComment,
  deleteComment,
  getComments,
} = require("../Controller/Comments.Controllers");
const verifyToken = require("../Middleware/verifyToken");

router.post("/create", verifyToken, createComment);
router.delete("/delete/:id", verifyToken, deleteComment);
router.get("/:id", getComments);

module.exports = router;
