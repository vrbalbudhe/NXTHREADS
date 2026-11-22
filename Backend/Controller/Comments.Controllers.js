const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");

const createComment = asyncHandler(async (req, res) => {
  const { postId, description } = req.valid.body;

  const post = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const newComment = await prisma.comment.create({
    data: { postId, commentor: req.userId, description },
    include: { user: { select: publicUserSelect } },
  });

  return res.status(201).json({
    success: true,
    message: "Comment created successfully",
    newComment,
  });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.valid.params;

  const comment = await prisma.comment.findUnique({
    where: { id },
    include: { post: { select: { userId: true } } },
  });
  if (!comment) {
    return res.status(404).json({ success: false, message: "Comment not found" });
  }

  const isAuthor = comment.commentor === req.userId;
  const isPostOwner = comment.post?.userId === req.userId;
  if (!isAuthor && !isPostOwner) {
    return res.status(403).json({
      success: false,
      message: "You can only delete your own comments or comments on your posts",
    });
  }

  await prisma.comment.delete({ where: { id } });

  return res.status(200).json({
    success: true,
    message: "Comment deleted successfully",
    deletedComment: { id, postId: comment.postId },
  });
});

const getComments = asyncHandler(async (req, res) => {
  const allComments = await prisma.comment.findMany({
    where: { postId: req.valid.params.id },
    include: { user: { select: publicUserSelect } },
    orderBy: { createdAt: "asc" },
  });

  return res.status(200).json({
    success: true,
    message: "Comments fetched successfully",
    data: allComments,
  });
});

module.exports = {
  createComment,
  deleteComment,
  getComments,
};
