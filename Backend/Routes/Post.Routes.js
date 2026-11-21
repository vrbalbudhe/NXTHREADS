const express = require("express");
const router = express.Router();
const {
  getPost,
  getPostUrl,
  getAllPosts,
  updatePost,
  deletePosts,
  createPosts,
  favUnfavPost,
  getFavoritePosts,
  getFollowersPost,
  getPostById,
} = require("../Controller/Post.Controller");
const verifyToken = require("../Middleware/verifyToken");
const {
  likePost,
  unlikePost,
  checkWhetherLike,
} = require("../Controller/Like.Controller");

router.get("/fltr", verifyToken, getPostUrl);
router.get("/:id", getPost);
router.get("/", getAllPosts);
router.post("/", verifyToken, createPosts);
router.put("/upd/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePosts);

router.post("/fav", verifyToken, favUnfavPost);
router.get("/fav/:id", verifyToken, getFavoritePosts);

router.get("/get/:id", getPostById);

router.post("/like", verifyToken, likePost);
router.post("/unlike", verifyToken, unlikePost);
router.post("/likecheck", verifyToken, checkWhetherLike);

router.get("/gfp/:userId", verifyToken, getFollowersPost);

module.exports = router;
