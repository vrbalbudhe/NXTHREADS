const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const likePost = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const existingLike = await prisma.like.findFirst({
      where: { postId, userId },
    });

    const existingUnlike = await prisma.unlike.findFirst({
      where: { postId, userId },
    });

    if (existingLike) {
      // User is un-liking
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      await prisma.posts.update({
        where: { id: postId },
        data: { likes: { decrement: 1 } },
      });

      return res.status(200).json({ message: "Post un-liked successfully" });
    }

    if (existingUnlike) {
      await prisma.unlike.delete({
        where: { id: existingUnlike.id },
      });

      await prisma.like.create({
        data: { userId, postId },
      });

      await prisma.posts.update({
        where: { id: postId },
        data: {
          likes: { increment: 1 },
          unlikes: { decrement: 1 },
        },
      });

      return res.status(200).json({ message: "Post liked successfully" });
    }
    await prisma.like.create({
      data: { userId, postId },
    });

    await prisma.posts.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    return res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const unlikePost = async (req, res) => {
  const { postId } = req.body;
  const { userId } = req.body;

  try {
    const existingUnlike = await prisma.unlike.findFirst({
      where: {
        postId,
        userId,
      },
    });
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingUnlike) {
      await prisma.unlike.create({
        data: {
          postId,
          userId,
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        await prisma.posts.update({
          where: { id: postId },
          data: { likes: { decrement: 1 }, unlikes: { increment: 1 } },
        });
      } else {
        await prisma.posts.update({
          where: { id: postId },
          data: { unlikes: { increment: 1 } },
        });
      }

      return res.status(200).json({ message: "Post disliked successfully" });
    }

    await prisma.unlike.delete({
      where: {
        id: existingUnlike.id,
      },
    });
    await prisma.posts.update({
      where: { id: postId },
      data: { unlikes: { decrement: 1 } },
    });

    return res.status(200).json({ message: "Post un-disliked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const checkWhetherLike = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    const isLiked = await prisma.like.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    const isUnliked = await prisma.unlike.findFirst({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    return res.status(200).json({
      isLiked: isLiked ? true : false,
      isUnliked: isUnliked ? true : false,
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  likePost,
  unlikePost,
  checkWhetherLike,
};
