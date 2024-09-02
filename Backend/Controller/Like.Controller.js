const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Function to handle liking or un-liking a post
const likePost = async (req, res) => {
  const { userId, postId } = req.body;

  try {
    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    // Check if the user has already disliked the post
    const existingUnlike = await prisma.unlike.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      // If the user already liked the post, unlike it
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // If the post is also disliked, remove the dislike
      if (existingUnlike) {
        await prisma.unlike.delete({
          where: {
            id: existingUnlike.id,
          },
        });
        await prisma.posts.update({
          where: { id: postId },
          data: { likes: { decrement: 1 }, dislikes: { decrement: 1 } },
        });
      } else {
        await prisma.posts.update({
          where: { id: postId },
          data: { likes: { decrement: 1 } },
        });
      }

      return res.status(200).json({ message: "Post un-liked successfully" });
    }

    if (existingUnlike) {
      // If the user has disliked the post, remove the dislike and add a like
      await prisma.unlike.delete({
        where: {
          id: existingUnlike.id,
        },
      });
      await prisma.posts.update({
        where: { id: postId },
        data: { dislikes: { decrement: 1 }, likes: { increment: 1 } },
      });
    } else {
      // Create a new like
      await prisma.like.create({
        data: {
          postId: postId,
          userId: userId,
        },
      });
      await prisma.posts.update({
        where: { id: postId },
        data: { likes: { increment: 1 } },
      });
    }

    return res.status(200).json({ message: "Post liked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Function to handle un-liking a post
const unlikePost = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    // Check if the user has already disliked the post
    const existingUnlike = await prisma.unlike.findFirst({
      where: {
        postId,
        userId,
      },
    });

    // Check if the user has already liked the post
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingUnlike) {
      // If the user has not disliked the post, add a dislike
      await prisma.unlike.create({
        data: {
          postId,
          userId,
        },
      });

      // If the post is already liked, remove the like
      if (existingLike) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        await prisma.posts.update({
          where: { id: postId },
          data: { likes: { decrement: 1 }, dislikes: { increment: 1 } },
        });
      } else {
        await prisma.posts.update({
          where: { id: postId },
          data: { dislikes: { increment: 1 } },
        });
      }

      return res.status(200).json({ message: "Post disliked successfully" });
    }

    // If the user has already disliked the post, remove the dislike
    await prisma.unlike.delete({
      where: {
        id: existingUnlike.id,
      },
    });
    await prisma.posts.update({
      where: { id: postId },
      data: { dislikes: { decrement: 1 } },
    });

    return res.status(200).json({ message: "Post un-disliked successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  likePost,
  unlikePost,
};
