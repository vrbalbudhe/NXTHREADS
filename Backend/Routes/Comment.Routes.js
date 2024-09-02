const express = require("express");
const router = express.Router();

const {
  createComment,
  deleteComment,
  getComments,
} = require("../Controller/Comments.Controllers");

router.post("/create", createComment);
router.delete("/delete/:id", deleteComment);
router.get("/:id", getComments);

module.exports = router;
