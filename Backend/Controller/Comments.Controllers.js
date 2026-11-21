const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const { publicUserSelect } = require("../lib/selects");
const { isObjectId, cleanString, invalidId } = require("../lib/validators");

const MAX_COMMENT_LENGTH = 2000;

const createComment = asyncHandler(async (req, res) => {
  const postId = req.body?.postId;
  const description = cleanString(req.body?.description);

  if (!isObjectId(postId)) {
    return invalidId(res, "post id");
  }
  if (!description || description.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({
      success: false,
      message: `Comment must be 1-${MAX_COMMENT_LENGTH} characters`,
    });
  }

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
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "comment id");
  }

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
  const postId = cleanString(req.params.id).split(",")[0].trim();
  if (!isObjectId(postId)) {
    return invalidId(res, "post id");
  }

  const allComments = await prisma.comment.findMany({
    where: { postId },
    include: { user: { select: publicUserSelect } },
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
