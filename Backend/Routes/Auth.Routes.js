const express = require("express");
const router = express.Router();

const auth = require("../Controller/Auth.Controller");
const IsLoginCall = require("../Middleware/verifyTokenRoute");
const verifyToken = require("../Middleware/verifyToken");
const createRateLimiter = require("../Middleware/rateLimit");
const validate = require("../Middleware/validate");
const schemas = require("../lib/schemas");

const MINUTE = 60 * 1000;

const limiter = (windowMinutes, max, message) =>
  createRateLimiter({ windowMs: windowMinutes * MINUTE, max, message });

const loginLimiter = limiter(15, 10, "Too many login attempts. Try again later");
const sendCodeLimiter = limiter(60, 10, "Too many code requests. Try again later");
const checkCodeLimiter = limiter(15, 15, "Too many verification attempts. Try again later");
const registerLimiter = limiter(60, 10, "Too many registration attempts. Try again later");
const mfaManageLimiter = limiter(15, 20, "Too many attempts. Try again later");

const body = (schema) => validate({ body: schema });
const s = schemas.auth;

// Registration (email OTP first, then account details)
router.post("/register/start", sendCodeLimiter, body(s.registerStart), auth.registerStart);
router.post("/register/verify", checkCodeLimiter, body(s.registerVerify), auth.registerVerify);
router.post("/register/complete", registerLimiter, body(s.registerComplete), auth.registerComplete);

// Sign in / out
router.post("/login", loginLimiter, body(s.login), auth.login);
router.post("/mfa/challenge", checkCodeLimiter, body(s.mfaChallenge), auth.mfaChallenge);
router.post("/mfa/challenge/resend", sendCodeLimiter, body(s.mfaResend), auth.mfaResend);
router.post("/logout", auth.logout);
router.get("/isLogin", IsLoginCall);

// Forgot password
router.post("/password/forgot", sendCodeLimiter, body(s.forgotPassword), auth.forgotPassword);
router.post("/password/reset", checkCodeLimiter, body(s.resetPassword), auth.resetPassword);

// MFA management (signed in)
router.get("/mfa", verifyToken, auth.getMfa);
router.post("/mfa/totp/setup", verifyToken, mfaManageLimiter, auth.totpSetup);
router.post("/mfa/totp/enable", verifyToken, mfaManageLimiter, body(s.mfaEnable), auth.totpEnable);
router.post("/mfa/email/setup", verifyToken, mfaManageLimiter, auth.emailSetup);
router.post(
  "/mfa/email/enable",
  verifyToken,
  mfaManageLimiter,
  body(s.mfaEnable),
  auth.emailEnable
);
router.post("/mfa/disable", verifyToken, mfaManageLimiter, body(s.mfaPassword), auth.disableMfa);
router.post(
  "/mfa/recovery-codes",
  verifyToken,
  mfaManageLimiter,
  body(s.mfaPassword),
  auth.regenerateRecoveryCodes
);

module.exports = router;
