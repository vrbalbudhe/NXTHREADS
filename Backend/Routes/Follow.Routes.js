const express = require("express");
const router = express.Router();
const {
  followUnfollowUser,
  checkIsFollwing,
  totalFollowing,
  totalFollowers
} = require("../Controller/Follow.Controller");
const verifyToken = require("../Middleware/verifyToken");

router.post("/follow", verifyToken, followUnfollowUser);
router.get("/follow/:id", verifyToken, checkIsFollwing);
router.get("/following/:id", verifyToken, totalFollowing);
router.get("/followers/:id", verifyToken, totalFollowers);

module.exports = router;
