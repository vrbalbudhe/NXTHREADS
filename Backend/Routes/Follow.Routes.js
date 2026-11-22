const express = require("express");
const router = express.Router();
const {
  followUnfollowUser,
  checkIsFollowing,
  totalFollowing,
  totalFollowers,
  isFollowing,
} = require("../Controller/Follow.Controller");
const verifyToken = require("../Middleware/verifyToken");
const validate = require("../Middleware/validate");
const schemas = require("../lib/schemas");

const byId = validate({ params: schemas.params.id });

router.post("/follow", verifyToken, validate({ body: schemas.follow.body }), followUnfollowUser);
router.get("/follow/:id", verifyToken, byId, checkIsFollowing);
router.get("/following/:id", byId, totalFollowing);
router.get("/followers/:id", byId, totalFollowers);
router.get("/status", validate({ query: schemas.follow.status }), isFollowing);

module.exports = router;
