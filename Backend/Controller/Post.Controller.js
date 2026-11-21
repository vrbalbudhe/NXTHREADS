const asyncHandler = require("express-async-handler");
const { Category } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { postInclude } = require("../lib/selects");
const { isObjectId, cleanString, isHttpUrl, invalidId } = require("../lib/validators");

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 10;
const MAX_IMAGES = 10;
const categories = new Set(Object.values(Category));

const parsePaging = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );
  return { page, limit, offset: (page - 1) * limit };
};

const parseImages = (images) => {
  if (images === undefined) {
    return { ok: true, value: undefined };
  }
  if (!Array.isArray(images) || images.length > MAX_IMAGES || !images.every(isHttpUrl)) {
    return { ok: false };
  }
  return { ok: true, value: images };
};

const getPostUrl = asyncHandler(async (req, res) => {
  const category = cleanString(req.query.category);
  const author = cleanString(req.query.author);

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

const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }

  const posts = await prisma.posts.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    include: postInclude,
  });

  return res.status(200).json({ posts });
});

const getAllPosts = asyncHandler(async (req, res) => {
  const { page, limit, offset } = parsePaging(req.query);

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: postInclude,
    }),
    prisma.posts.count(),
  ]);

  return res.status(200).json({
    posts,
    meta: {
      total,
      page,
      limit,
      hasMore: offset + posts.length < total,
    },
  });
});

const createPosts = asyncHandler(async (req, res) => {
  const title = cleanString(req.body?.title);
  const subtitle = cleanString(req.body?.subtitle);
  const content = cleanString(req.body?.content);
  const category = cleanString(req.body?.category);
  const images = parseImages(req.body?.images ?? []);

  if (!title || !subtitle || !content) {
    return res.status(400).json({
      success: false,
      message: "Title, subtitle and content are required",
    });
  }
  if (!categories.has(category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }
  if (!images.ok) {
    return res.status(400).json({
      success: false,
      message: `Images must be up to ${MAX_IMAGES} http(s) URLs`,
    });
  }

  const newPost = await prisma.posts.create({
    data: {
      title,
      subtitle,
      category,
      content,
      author: req.session?.username || "",
      images: images.value,
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
  const { id } = req.params;
  if (!isObjectId(id)) {
    invalidId(res, "post id");
    return null;
  }
  const post = await prisma.posts.findUnique({ where: { id } });
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

  const title = cleanString(req.body?.title);
  const subtitle = cleanString(req.body?.subtitle);
  const content = cleanString(req.body?.content);
  const category = cleanString(req.body?.category);
  const images = parseImages(req.body?.images);

  if (category && !categories.has(category)) {
    return res.status(400).json({ success: false, message: "Invalid category" });
  }
  if (!images.ok) {
    return res.status(400).json({
      success: false,
      message: `Images must be up to ${MAX_IMAGES} http(s) URLs`,
    });
  }

  const updatedPost = await prisma.posts.update({
    where: { id: post.id },
    data: {
      ...(title && { title }),
      ...(subtitle && { subtitle }),
      ...(content && { content }),
      ...(category && { category }),
      ...(images.value && { images: images.value }),
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
  const postId = req.body?.postId;

  if (!isObjectId(postId)) {
    return invalidId(res, "post id");
  }

  const post = await prisma.posts.findUnique({ where: { id: postId }, select: { id: true } });
  if (!post) {
    return res.status(404).json({ success: false, message: "Post not found" });
  }

  const key = { userId_postId: { userId, postId } };
  const existing = await prisma.savedPosts.findUnique({ where: key });

  if (existing) {
    await prisma.savedPosts.delete({ where: key });
    return res.status(200).json({ success: true, message: "Post removed from favourites" });
  }

  await prisma.savedPosts.create({ data: { userId, postId } });
  return res.status(200).json({ success: true, message: "Post added to favourites" });
});

const getFavoritePosts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "user id");
  }
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
  const { page, limit, offset } = parsePaging(req.query);

  const followedUsers = await prisma.follows.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const where = {
    userId: { in: [...followedUsers.map((follow) => follow.followingId), userId] },
  };

  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      where,
      include: postInclude,
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.posts.count({ where }),
  ]);

  return res.status(200).json({
    posts,
    meta: { total, page, limit, hasMore: offset + posts.length < total },
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isObjectId(id)) {
    return invalidId(res, "post id");
  }

  const post = await prisma.posts.findUnique({
    where: { id },
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
  favUnfavPost,
  getFollowersPost,
  getFavoritePosts,
};
