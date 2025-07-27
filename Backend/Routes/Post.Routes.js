const express = require("express");
const router = express.Router();
const {
  getPost,
  getPostUrl,
  getAllPosts,
  updatePosts,
  deletePosts,
  createPosts,
  favUnfavPost,
  getFavoritePosts,
} = require("../Controller/Post.Controller");
const verifyToken = require("../Middleware/verifyToken");
const {
  likePost,
  unlikePost,
  checkWhetherLike,
} = require("../Controller/Like.Controller");

router.get("/fltr", getPostUrl);
router.get("/:id", getPost);
router.get("/", getAllPosts);
router.post("/", verifyToken, createPosts);
router.put("/:id", verifyToken, updatePosts);
router.delete("/:id", deletePosts);

router.post("/fav", verifyToken, favUnfavPost);
router.get("/fav/:id", verifyToken, getFavoritePosts);

router.post("/like", likePost);
router.post("/unlike", unlikePost);
router.post("/likecheck", checkWhetherLike);

module.exports = router;
