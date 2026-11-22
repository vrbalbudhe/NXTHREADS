const asyncHandler = require("express-async-handler");
const { Category } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { postInclude } = require("../lib/selects");
const { containsText } = require("../lib/text");

const categories = new Set(Object.values(Category));

const pageMeta = ({ page, limit }, count, total) => ({
  total,
  page,
  limit,
  hasMore: (page - 1) * limit + count < total,
});

const findPaged = async (where, paging) => {
  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: "desc" },
      skip: (paging.page - 1) * paging.limit,
      take: paging.limit,
    }),
    prisma.posts.count({ where }),
  ]);
  return { posts, meta: pageMeta(paging, posts.length, total) };
};

const getPostUrl = asyncHandler(async (req, res) => {
  const { category, author } = req.valid.query;

  const posts = await prisma.posts.findMany({
    where: {
      ...(categories.has(category) && { category }),
      ...(author && author !== "All" && { author }),
    },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  return res.status(200).json({ posts });
});

const searchPosts = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.valid.query;
  const contains = containsText(q);

  const result = await findPaged(
    {
      OR: [
        { title: contains },
        { subtitle: contains },
        { content: contains },
        { author: contains },
      ],
    },
    { page, limit }
  );

  return res.status(200).json(result);
});

const getPost = asyncHandler(async (req, res) => {
  const posts = await prisma.posts.findMany({
    where: { userId: req.valid.params.id },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  return res.status(200).json({ posts });
});

const getAllPosts = asyncHandler(async (req, res) => {
  return res.status(200).json(await findPaged({}, req.valid.query));
});

const createPosts = asyncHandler(async (req, res) => {
  const { title, subtitle, content, category, images } = req.valid.body;

  const newPost = await prisma.posts.create({
    data: {
      title,
      subtitle,
      category,
      content,
      images,
      author: req.session?.username || "",
      userId: req.userId,
    },
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    post: newPost,
  });
});

const findOwnedPost = async (req, res) => {
  const post = await prisma.posts.findUnique({ where: { id: req.valid.params.id } });
  if (!post) {
    res.status(404).json({ success: false, message: "Post not found" });
    return null;
  }
  if (post.userId !== req.userId) {
    res.status(403).json({ success: false, message: "You can only change your own posts" });
    return null;
  }
  return post;
};

const updatePost = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) {
    return undefined;
  }

  const { title, subtitle, content, category, images } = req.valid.body;

  const updatedPost = await prisma.posts.update({
    where: { id: post.id },
    data: {
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(content && { content }),
      ...(category && { category }),
      ...(images && { images }),
    },
  });

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: updatedPost,
  });
});

const deletePosts = asyncHandler(async (req, res) => {
  const post = await findOwnedPost(req, res);
  if (!post) {
    return undefined;
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId: post.id } }),
    prisma.like.deleteMany({ where: { postId: post.id } }),
    prisma.unlike.deleteMany({ where: { postId: post.id } }),
    prisma.savedPosts.deleteMany({ where: { postId: post.id } }),
    prisma.posts.delete({ where: { id: post.id } }),
  ]);

  return res.status(200).json({ success: true, message: "Post deleted successfully" });
});

const favUnfavPost = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const { postId } = req.valid.body;

  const post = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const key = { userId_postId: { userId, postId } };
  const existing = await prisma.savedPosts.findUnique({ where: key });

  if (existing) {
    await prisma.savedPosts.delete({ where: key });
    return res
      .status(200)
      .json({ success: true, saved: false, message: "Post removed from favourites" });
  }

  await prisma.savedPosts.create({ data: { userId, postId } });
  return res.status(200).json({ success: true, saved: true, message: "Post added to favourites" });
});

const getFavoritePosts = asyncHandler(async (req, res) => {
  const { id } = req.valid.params;
  if (id !== req.userId) {
    return res.status(403).json({ success: false, message: "Saved posts are private" });
  }

  const favoritePosts = await prisma.savedPosts.findMany({
    where: { userId: id },
    include: { post: { include: postInclude } },
  });

  return res.status(200).json({
    posts: favoritePosts.map((saved) => saved.post).filter(Boolean),
  });
});

const getFollowersPost = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const followedUsers = await prisma.follows.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const where = {
    userId: { in: [...followedUsers.map((follow) => follow.followingId), userId] },
  };

  return res.status(200).json(await findPaged(where, req.valid.query));
});

const getPostById = asyncHandler(async (req, res) => {
  const post = await prisma.posts.findUnique({
    where: { id: req.valid.params.id },
    include: postInclude,
  });

  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  return res.status(200).json({ posts: [post] });
});

module.exports = {
  getPost,
  getAllPosts,
  getPostById,
  deletePosts,
  updatePost,
  createPosts,
  getPostUrl,
  searchPosts,
  favUnfavPost,
  getFollowersPost,
  getFavoritePosts,
};
