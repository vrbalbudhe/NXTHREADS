const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

const ensurePost = async (req, res) => {
  const { postId } = req.valid.body;
  const post = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    res.status(404).json({ success: false, message: "Post not found" });
    return null;
  }
  return postId;
};

const reactionState = async (postId, userId) => {
  const [post, like, unlike] = await Promise.all([
    prisma.posts.findUnique({
      where: { id: postId },
      select: { likes: true, unlikes: true },
    }),
    prisma.like.findFirst({ where: { postId, userId }, select: { id: true } }),
    prisma.unlike.findFirst({ where: { postId, userId }, select: { id: true } }),
  ]);
  return {
    postId,
    likes: Math.max(post?.likes ?? 0, 0),
    unlikes: Math.max(post?.unlikes ?? 0, 0),
    isLiked: Boolean(like),
    isUnliked: Boolean(unlike),
  };
};

const likePost = asyncHandler(async (req, res) => {
  const postId = await ensurePost(req, res);
  if (!postId) {
    return undefined;
  }
  const userId = req.userId;

  const message = await prisma.$transaction(async (tx) => {
    const existingLike = await tx.like.findFirst({ where: { postId, userId } });
    if (existingLike) {
      await tx.like.delete({ where: { id: existingLike.id } });
      await tx.posts.update({ where: { id: postId }, data: { likes: { decrement: 1 } } });
      return "Post un-liked successfully";
    }

    const existingUnlike = await tx.unlike.findFirst({ where: { postId, userId } });
    await tx.like.create({ data: { userId, postId } });

    if (existingUnlike) {
      await tx.unlike.delete({ where: { id: existingUnlike.id } });
      await tx.posts.update({
        where: { id: postId },
        data: { likes: { increment: 1 }, unlikes: { decrement: 1 } },
      });
    } else {
      await tx.posts.update({ where: { id: postId }, data: { likes: { increment: 1 } } });
    }
    return "Post liked successfully";
  });

  return res.status(200).json({
    success: true,
    message,
    ...(await reactionState(postId, userId)),
  });
});

const unlikePost = asyncHandler(async (req, res) => {
  const postId = await ensurePost(req, res);
  if (!postId) {
    return undefined;
  }
  const userId = req.userId;

  const message = await prisma.$transaction(async (tx) => {
    const existingUnlike = await tx.unlike.findFirst({ where: { postId, userId } });
    if (existingUnlike) {
      await tx.unlike.delete({ where: { id: existingUnlike.id } });
      await tx.posts.update({ where: { id: postId }, data: { unlikes: { decrement: 1 } } });
      return "Post un-disliked successfully";
    }

    const existingLike = await tx.like.findFirst({ where: { postId, userId } });
    await tx.unlike.create({ data: { postId, userId } });

    if (existingLike) {
      await tx.like.delete({ where: { id: existingLike.id } });
      await tx.posts.update({
        where: { id: postId },
        data: { likes: { decrement: 1 }, unlikes: { increment: 1 } },
      });
    } else {
      await tx.posts.update({ where: { id: postId }, data: { unlikes: { increment: 1 } } });
    }
    return "Post disliked successfully";
  });

  return res.status(200).json({
    success: true,
    message,
    ...(await reactionState(postId, userId)),
  });
});

const checkWhetherLike = asyncHandler(async (req, res) => {
  const { postId } = req.valid.body;
  const userId = req.userId;

  const [isLiked, isUnliked] = await Promise.all([
    prisma.like.findFirst({ where: { userId, postId }, select: { id: true } }),
    prisma.unlike.findFirst({ where: { userId, postId }, select: { id: true } }),
  ]);

  return res.status(200).json({ isLiked: Boolean(isLiked), isUnliked: Boolean(isUnliked) });
});

module.exports = {
  likePost,
  unlikePost,
  checkWhetherLike,
};
