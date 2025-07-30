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

router.get("/fltr", getPostUrl);
router.get("/:id", getPost);
router.get("/", getAllPosts);
router.post("/", verifyToken, createPosts);
router.put("/upd/:id", updatePost);
router.delete("/:id", deletePosts);

router.post("/fav", verifyToken, favUnfavPost);
router.get("/fav/:id", verifyToken, getFavoritePosts);

router.get("/get/:id", getPostById);

router.post("/like", likePost);
router.post("/unlike", unlikePost);
router.post("/likecheck", checkWhetherLike);

router.get("/gfp/:userId", getFollowersPost)

module.exports = router;
