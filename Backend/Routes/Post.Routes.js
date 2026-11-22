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
  favUnfavPost,
  getFavoritePosts,
  getFollowersPost,
  getPostById,
} = require("../Controller/Post.Controller");
const { likePost, unlikePost, checkWhetherLike } = require("../Controller/Like.Controller");
const verifyToken = require("../Middleware/verifyToken");
const validate = require("../Middleware/validate");
const createRateLimiter = require("../Middleware/rateLimit");
const schemas = require("../lib/schemas");

const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many searches. Try again in a minute",
});

const byId = validate({ params: schemas.params.id });
const byPostIdBody = validate({ body: schemas.post.postIdBody });

router.get("/fltr", validate({ query: schemas.post.filter }), getPostUrl);
router.get("/search", searchLimiter, validate({ query: schemas.post.search }), searchPosts);
router.get("/", validate({ query: schemas.paging }), getAllPosts);
router.get("/:id", byId, getPost);
router.post("/", verifyToken, validate({ body: schemas.post.create }), createPosts);
router.put(
  "/upd/:id",
  verifyToken,
  validate({ params: schemas.params.id, body: schemas.post.update }),
  updatePost
);
router.delete("/:id", verifyToken, byId, deletePosts);

router.post("/fav", verifyToken, byPostIdBody, favUnfavPost);
router.get("/fav/:id", verifyToken, byId, getFavoritePosts);

router.get("/get/:id", byId, getPostById);

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
