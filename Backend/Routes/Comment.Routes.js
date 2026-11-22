const express = require("express");
const router = express.Router();

const { createComment, deleteComment, getComments } = require("../Controller/Comments.Controllers");
const verifyToken = require("../Middleware/verifyToken");
const validate = require("../Middleware/validate");
const createRateLimiter = require("../Middleware/rateLimit");
const schemas = require("../lib/schemas");

const commentLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: "You are commenting too quickly",
});

router.post(
  "/create",
  verifyToken,
  commentLimiter,
  validate({ body: schemas.comment.create }),
  createComment
);
router.delete("/delete/:id", verifyToken, validate({ params: schemas.params.id }), deleteComment);
router.get("/:id", validate({ params: schemas.params.postIdList }), getComments);

module.exports = router;
