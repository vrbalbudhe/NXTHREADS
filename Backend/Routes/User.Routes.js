const express = require("express");
const router = express.Router();

const {
  getUser,
  getUsers,
  searchUsers,
  deleteUser,
  updateUser,
  getUserFollowStatus,
  getSuggestions,
  getInterests,
  updateInterests,
} = require("../Controller/User.Controller");
const verifyToken = require("../Middleware/verifyToken");
const optionalAuth = require("../Middleware/optionalAuth");
const validate = require("../Middleware/validate");
const createRateLimiter = require("../Middleware/rateLimit");
const schemas = require("../lib/schemas");

const passwordCheckLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many attempts. Try again later",
});
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many searches. Try again in a minute",
});

const byId = validate({ params: schemas.params.id });

router.get("/", verifyToken, getUsers);
router.get(
  "/search",
  verifyToken,
  searchLimiter,
  validate({ query: schemas.user.search }),
  searchUsers
);
router.get(
  "/suggestions",
  verifyToken,
  validate({ query: schemas.user.suggestions }),
  getSuggestions
);
router.get("/me/interests", verifyToken, getInterests);
router.put(
  "/me/interests",
  verifyToken,
  validate({ body: schemas.user.interests }),
  updateInterests
);
router.get("/foll/:id", verifyToken, byId, getUserFollowStatus);
router.get("/:id", optionalAuth, byId, getUser);
router.delete(
  "/:id",
  verifyToken,
  passwordCheckLimiter,
  validate({ params: schemas.params.id, body: schemas.user.remove }),
  deleteUser
);
router.put(
  "/upd/:id",
  verifyToken,
  passwordCheckLimiter,
  validate({ params: schemas.params.id, body: schemas.user.update }),
  updateUser
);

module.exports = router;
