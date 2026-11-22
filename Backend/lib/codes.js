const crypto = require("crypto");
const prisma = require("./prisma");
const { jwtSecret, codeResendCooldownMs } = require("../Config/env");
const { getValue, setValue } = require("./store");
const { sendTemplate } = require("./mailer");

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = codeResendCooldownMs;
const MAX_ATTEMPTS = 5;

class CodeError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const hashCode = (email, purpose, code) =>
  crypto.createHmac("sha256", jwtSecret).update(`${purpose}:${email}:${code}`).digest("hex");

const safeEqual = (a, b) => {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
};

const cooldownKey = (email, purpose) => `code:cooldown:${purpose}:${email}`;

/**
 * Enforces one email per address and purpose per minute. Call it before any branch that
 * decides whether to send, so responses look the same whether or not an account exists.
 */
const claimSendSlot = async (email, purpose) => {
  const key = cooldownKey(email, purpose);
  if (await getValue(key)) {
    throw new CodeError(429, "Please wait a minute before requesting another code");
  }
  await setValue(key, "1", RESEND_COOLDOWN_MS);
};

const issueCode = async (email, purpose) => {
  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");
  const codeHash = hashCode(email, purpose, code);
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);

  await prisma.verificationCode.upsert({
    where: { email_purpose: { email, purpose } },
    update: { codeHash, attempts: 0, expiresAt, createdAt: new Date() },
    create: { email, purpose, codeHash, attempts: 0, expiresAt },
  });

  try {
    await sendTemplate(email, purpose, code);
  } catch (error) {
    console.error(`Failed to send ${purpose} email: ${error.message}`);
    await prisma.verificationCode.deleteMany({ where: { email, purpose } });
    throw new CodeError(502, "Could not send the email. Please try again later");
  }
};

/** Returns true and deletes the code when it matches; every call counts as one attempt. */
const consumeCode = async (email, purpose, code) => {
  const { count } = await prisma.verificationCode.updateMany({
    where: { email, purpose, expiresAt: { gt: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  });
  if (count === 0) {
    await prisma.verificationCode.deleteMany({ where: { email, purpose } });
    return false;
  }

  const record = await prisma.verificationCode.findUnique({
    where: { email_purpose: { email, purpose } },
  });
  if (!record || !safeEqual(record.codeHash, hashCode(email, purpose, code))) {
    return false;
  }

  await prisma.verificationCode.deleteMany({ where: { email, purpose } });
  return true;
};

/** True when an unexpired code with attempts left is waiting for this address. */
const hasActiveCode = async (email, purpose) =>
  (await prisma.verificationCode.count({
    where: { email, purpose, expiresAt: { gt: new Date() }, attempts: { lt: MAX_ATTEMPTS } },
  })) > 0;

const clearCodes = (email, purpose) =>
  prisma.verificationCode.deleteMany({ where: { email, ...(purpose && { purpose }) } });

module.exports = {
  CodeError,
  claimSendSlot,
  issueCode,
  consumeCode,
  hasActiveCode,
  clearCodes,
  safeEqual,
  CODE_TTL_MS,
};
