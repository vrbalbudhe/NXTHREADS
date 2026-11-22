const express = require("express");
const router = express.Router();

const {
  getUser,
  getUsers,
  searchUsers,
  deleteUser,
  updateUser,
  getUserFollowStatus,
} = require("../Controller/User.Controller");
const verifyToken = require("../Middleware/verifyToken");
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

router.use(verifyToken);

router.get("/", getUsers);
router.get("/search", searchLimiter, validate({ query: schemas.user.search }), searchUsers);
router.get("/foll/:id", byId, getUserFollowStatus);
router.get("/:id", byId, getUser);
router.delete(
  "/:id",
  passwordCheckLimiter,
  validate({ params: schemas.params.id, body: schemas.user.remove }),
  deleteUser
);
router.put(
  "/upd/:id",
  passwordCheckLimiter,
  validate({ params: schemas.params.id, body: schemas.user.update }),
  updateUser
);

module.exports = router;
