require("dotenv").config();

const requiredVariables = ["DATABASE_URL", "JWT_SECRET_KEY"];
const missingVariables = requiredVariables.filter((name) => !process.env[name]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(", ")}`);
}

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && process.env.JWT_SECRET_KEY.length < 32) {
  throw new Error("JWT_SECRET_KEY must be at least 32 characters in production");
}

const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  path: "/",
};

module.exports = {
  isProduction,
  port: Number(process.env.PORT) || 8000,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  trustProxy: process.env.TRUST_PROXY === "true",
  redisUrl: process.env.REDIS_URL || "",
  jwtSecret: process.env.JWT_SECRET_KEY,
  // Minimum gap between two emailed codes for the same address and purpose.
  codeResendCooldownMs: Number(process.env.CODE_RESEND_COOLDOWN_MS) || 60 * 1000,
  mfaEncryptionKey: process.env.MFA_ENCRYPTION_KEY || process.env.JWT_SECRET_KEY,
  jwtExpiresIn: "7d",
  sessionMaxAgeMs,
  sessionCookieOptions,
  smtp: {
    service: process.env.SMTP_SERVICE || "Gmail",
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
  },
};
