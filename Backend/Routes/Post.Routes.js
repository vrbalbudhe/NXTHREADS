const express = require("express");
const router = express.Router();
const {
  getPost,
  getPostUrl,
  getAllPosts,
  updatePost,
  deletePosts,
  createPosts,
  searchPosts,
  getCategories,
  getStats,
  favUnfavPost,
  getFavoritePosts,
  getFollowersPost,
  getPostById,
  getForYouFeed,
  getTrendingTopics,
  getRelatedPosts,
} = require("../Controller/Post.Controller");
const { likePost, unlikePost, checkWhetherLike } = require("../Controller/Like.Controller");
const verifyToken = require("../Middleware/verifyToken");
const validate = require("../Middleware/validate");
const optionalAuth = require("../Middleware/optionalAuth");
const createRateLimiter = require("../Middleware/rateLimit");
const schemas = require("../lib/schemas");

const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many searches. Try again in a minute",
});

const byId = validate({ params: schemas.params.id });
const byIdPaged = validate({ params: schemas.params.id, query: schemas.paging });
const byPostIdBody = validate({ body: schemas.post.postIdBody });

router.get(
  "/fltr",
  optionalAuth,
  validate({ query: schemas.post.filter.extend(schemas.paging.shape) }),
  getPostUrl
);
router.get("/categories", getCategories);
router.get("/trending", getTrendingTopics);
router.get("/feed", verifyToken, validate({ query: schemas.paging }), getForYouFeed);
router.get("/related/:id", optionalAuth, byId, getRelatedPosts);
router.get("/stats", getStats);
router.get(
  "/search",
  searchLimiter,
  optionalAuth,
  validate({ query: schemas.post.search }),
  searchPosts
);
router.get("/", optionalAuth, validate({ query: schemas.paging }), getAllPosts);
router.get("/:id", optionalAuth, byIdPaged, getPost);
router.post("/", verifyToken, validate({ body: schemas.post.create }), createPosts);
router.put(
  "/upd/:id",
  verifyToken,
  validate({ params: schemas.params.id, body: schemas.post.update }),
  updatePost
);
router.delete("/:id", verifyToken, byId, deletePosts);

router.post("/fav", verifyToken, byPostIdBody, favUnfavPost);
router.get("/fav/:id", verifyToken, byIdPaged, getFavoritePosts);

router.get("/get/:id", optionalAuth, byId, getPostById);

router.post("/like", verifyToken, byPostIdBody, likePost);
router.post("/unlike", verifyToken, byPostIdBody, unlikePost);
router.post("/likecheck", verifyToken, byPostIdBody, checkWhetherLike);

router.get(
  "/gfp/:userId",
  verifyToken,
  validate({ params: schemas.params.userId, query: schemas.paging }),
  getFollowersPost
);

module.exports = router;
