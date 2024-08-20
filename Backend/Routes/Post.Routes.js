const express = require("express");
const router = express.Router();
const {
  // Deployed Routes
  getPost,
  getPostUrl,
  getAllPosts,
  updatePosts,
  deletePosts,
  createPosts,
  // searchPosts,
  // Non-Deployed Routes
  favUnfavPost,
  getFavoritePosts,
} = require("../Controller/Post.Controller");
const verifyToken = require("../Middleware/verifyToken");

router.get("/:id", verifyToken, getPost);
router.get("/fltr/:id", getPostUrl);
router.get("/", getAllPosts);
router.post("/", verifyToken, createPosts);
router.put("/:id", verifyToken, updatePosts);
router.delete("/:id", verifyToken, deletePosts);
// router.get("/search/:term",savedPosts);

router.post("/fav", verifyToken, favUnfavPost);
router.get("/fav/:id", verifyToken, getFavoritePosts);

module.exports = router;
