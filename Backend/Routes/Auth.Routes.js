const express = require("express");
const router = express.Router();

const { register, login, logout, optFinalization } = require("../Controller/Auth.Controller");
const IsLoginCall = require("../Middleware/verifyTokenRoute");
const createRateLimiter = require("../Middleware/rateLimit");
const validate = require("../Middleware/validate");
const schemas = require("../lib/schemas");

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many login attempts. Try again later",
});
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many registration attempts. Try again later",
});
const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many verification attempts. Try again later",
});

router.post("/register", registerLimiter, validate({ body: schemas.auth.register }), register);
router.post("/verify-otp", otpLimiter, validate({ body: schemas.auth.verifyOtp }), optFinalization);
router.post("/login", loginLimiter, validate({ body: schemas.auth.login }), login);
router.post("/logout", logout);
router.get("/isLogin", IsLoginCall);

module.exports = router;
