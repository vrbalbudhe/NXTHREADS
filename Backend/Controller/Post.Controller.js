const asyncHandler = require("express-async-handler");
const prisma = require("../lib/prisma");
const redisClient = require("../Config/redisClient");
/*
 * CRUD {Create,Read,Update,Delete} Operation
 */

const getPostUrl = asyncHandler(async (req, res) => {
  const query = req.params.id;
  const params = new URLSearchParams(query);
  const category = params.get("category");
  const author = params.get("author");
  try {
    const posts = await prisma.posts.findMany({
      where: {
        category: category || undefined,
        author: author || undefined,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
    return res.status(200).json({ posts });
    // console.log(query);
  } catch (error) {
    return res.status(501).json({
      message: "Unable to GET URL POST",
      success: false,
    });
  }
});

const getPost = asyncHandler(async (req, res) => {
  const id = req.params.id;
  try {
    const post = await prisma.posts.findMany({
      where: { userId: id },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!post) {
      return res.status(403).json({
        message: "Post Not Found",
        success: false,
      });
    }

    return res.status(200).json({
      posts: post,
    });
  } catch (error) {
    console.log(error);
    return res.status(501).json({
      message: "Failed to GetPost",
      success: false,
    });
  }
});

/*
 * Get ALL POSTS
 */
const getAllPosts = asyncHandler(async (req, res) => {
  try {
    const posts = await prisma.posts.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        savedPosts: true,
      },
    });
    return res.status(200).json({
      posts: posts,
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
    // Requesting Post Data
    const { title, subtitle, category, author, content, images } = req.body;

    if (!title || !subtitle || !category || !author || !content) {
      return res.status(400).json({
        message: "All fields are mandatory",
        success: false,
      });
    }
    const imageUrls = images || []; // Default to an empty array if no images are provided
    // Saving the Post
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

/*
 * Delete Route will check whether the Login-User id and delete post id is matching
 * if macthing then deletion is allowwed
 * Otherwise, none
 */
const deletePosts = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.posts.findUnique({
      where: { id: postId, userId: tokenUserId },
    });
    if (!post) {
      return res.status(403).json({
        message: "Post Not Found",
        success: false,
      });
    }

    if (tokenUserId !== post.userId) {
      return res.status(401).json({
        message: "U are not authorized to delete the post",
        success: false,
      });
    }
    await prisma.posts.delete({
      where: { id: postId, userId: tokenUserId },
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

// const searchPosts = asyncHandler(async (req, res) => {
//   const searchTerms = req.body;
//   try {
//     const termsArray = searchTerms
//       .split(" ")
//       .filter((term) => term.trim() !== "");

//     // Perform search with multiple terms
//     const posts = await prisma.posts.findMany({
//       where: {
//         OR: termsArray.map((term) => ({
//           OR: [
//             { title: { contains: term, mode: "insensitive" } },
//             { content: { contains: term, mode: "insensitive" } },
//           ],
//         })),
//       },
//     });

//     return res.status(200).json({
//       posts: posts,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       message: "error in search",
//       success: false,
//     });
//   }
// });

module.exports = {
  // Deployed Routes
  getPost,
  getAllPosts,
  deletePosts,
  updatePosts,
  createPosts,
  getPostUrl,
  // searchPosts,

  // Not Deployed Routes
  favUnfavPost,
  getFavoritePosts,
};
