const express = require("express");
const router = express.Router();
const {
  followUnfollowUser,
  checkIsFollwing,
  totalFollowing,
  totalFollowers,
  isFollowing,
} = require("../Controller/Follow.Controller");
const verifyToken = require("../Middleware/verifyToken");

router.post("/follow", followUnfollowUser);
router.get("/follow/:id", checkIsFollwing);
router.get("/following/:id", totalFollowing);
router.get("/followers/:id", totalFollowers);
router.get("/status", isFollowing);

module.exports = router;
