const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");

const getPostUrl = asyncHandler(async (req, res) => {
  const { category, author } = req.query;

  try {
    const posts = await prisma.posts.findMany({
      where: {
        category: category || undefined,
        author: author || undefined,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        savedPosts: true,
        User: {
          select: {
            password: false,
            avatar: true,
          },
        },
        comment: {
          include: {
            user: true,
            post: {
              include: {
                User: {
                  select: {
                    password: false,
                    fullname: true,
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({ posts });
  } catch (error) {
    return res.status(501).json({
      message: "Unable to GET URL POST",
      success: false,
    });
  }
});

const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.posts.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        savedPosts: true,
        User: {
          select: {
            password: false,
            avatar: true,
          },
        },
        comment: {
          include: {
            user: true,
            post: {
              include: {
                User: {
                  select: {
                    password: false,
                    fullname: true,
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!post) {
      return res.status(403).json({
        message: "Post Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      posts: post || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetPost",
      success: false,
    });
  }
});

const getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  try {
    const posts = await prisma.posts.findMany({
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        savedPosts: true,
        User: {
          select: {
            password: false,
            avatar: true,
            fullname: true,
            username: true,
          },
        },
        comment: {
          include: {
            user: true,
            post: {
              include: {
                User: {
                  select: {
                    password: false,
                    fullname: true,
                    avatar: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // console.log(limit);

    const total = await prisma.posts.count();
    console.log(total);

    return res.status(200).json({
      posts: posts,
      meta: {
        total,
        page,
        limit,
        hasMore: offset + posts.length < total,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetPosts",
      success: false,
    });
  }
});

const createPosts = asyncHandler(async (req, res) => {
  const tokenUserId = req.userId;

  try {
    const { title, subtitle, category, author, content, images } = req.body;

    const imageUrls = images || [];
    const newPost = await prisma.posts.create({
      data: {
        title,
        subtitle,
        category,
        author,
        content,
        images: imageUrls,
        userId: tokenUserId,
      },
    });

    if (newPost) {
      return res.status(200).json({
        message: "Post created successfully",
        success: true,
        post: newPost,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to create post",
      success: false,
    });
  }
});

const updatePosts = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to UpdatePost",
      success: false,
    });
  }
});

const deletePosts = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  console.log(postId)
  try {
    const post = await prisma.posts.findUnique({
      where: { id: postId },
    });
    if (!post) {
      return res.status(403).json({
        message: "Post Not Found",
        success: false,
      });
    }
    await prisma.posts.delete({
      where: { id: postId },
    });
    return res.status(200).json({
      message: "Post Deleted Successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to DeletePost",
      success: false,
    });
  }
});

const favUnfavPost = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const postId = req.body.postId;

  // Validate input
  if (!userId || !postId) {
    return res.status(400).json({
      message: "Invalid userId or postId",
    });
  }

  try {
    // Check if the post is already saved by the user
    const checkPost = await prisma.savedPosts.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (!checkPost) {
      // If not found, add it to saved posts
      await prisma.savedPosts.create({
        data: {
          userId: userId,
          postId: postId,
        },
      });
      return res.status(200).json({
        message: "Post Made Favourite",
      });
    } else {
      // If found, remove it from saved posts
      await prisma.savedPosts.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });
      return res.status(200).json({
        message: "Post Made Unfavourite",
      });
    }
  } catch (error) {
    console.error("Error in favUnfavPost:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

const getFavoritePosts = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  try {
    const favoritePosts = await prisma.savedPosts.findMany({
      where: {
        userId: userId,
      },
      include: {
        post: true,
      },
    });

    if (!favoritePosts.length) {
      return res.status(404).json({
        message: "No Favorite Posts Found!",
        success: false,
      });
    }

    return res.status(200).json({
      posts: favoritePosts,
    });
  } catch (error) {
    console.error("Error fetching favorite posts:", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

const getFollowersPost = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).json({ message: "User ID is required in params" });
    }
    
    const followedUsers = await prisma.follows.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    console.log("Followed users:", followedUsers);

    const followingIds = followedUsers.map(f => f.followingId);

    const allUserIds = [...followingIds, userId];
    console.log("All user IDs (following + self):", allUserIds);

    const posts = await prisma.posts.findMany({
      where: {
        userId: { in: allUserIds },
      },
      include: {
        User: true,
        comment: true,
        like: true,
        unlike: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log("Found posts:", posts.length);

    if (posts.length === 0) {
      return res.status(200).json([]);
    }

    const shuffled = posts.sort(() => 0.5 - Math.random());

    const limitedPosts = shuffled.slice(0, 20);

    res.status(200).json(limitedPosts);

  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = {
  getPost,
  getAllPosts,
  deletePosts,
  updatePosts,
  createPosts,
  getPostUrl,
  favUnfavPost,
  getFollowersPost,
  getFavoritePosts,
};
