const crypto = require("crypto");
const { mfaEncryptionKey } = require("../Config/env");
const { getValue, setValue, removeKeys, increment } = require("./store");

const ISSUER = "NXTHREADS";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_WINDOW = 1;
const RECOVERY_CODE_COUNT = 10;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const CHALLENGE_MAX_ATTEMPTS = 5;
const PENDING_SETUP_TTL_MS = 10 * 60 * 1000;

// ---------- Base32 (RFC 4648, no padding) ----------

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

const base32Encode = (buffer) => {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = input.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = BASE32.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 secret");
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

// ---------- TOTP (RFC 6238, HMAC-SHA1) ----------

const hotp = (secret, counter) => {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac("sha1", base32Decode(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary = digest.readUInt32BE(offset) & 0x7fffffff;
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
};

const currentCounter = () => Math.floor(Date.now() / 1000 / TOTP_STEP_SECONDS);

/** Returns the matching time-step counter, or null. */
const matchTotp = (secret, code) => {
  const now = currentCounter();
  for (let drift = -TOTP_WINDOW; drift <= TOTP_WINDOW; drift += 1) {
    const candidate = Buffer.from(hotp(secret, now + drift));
    const received = Buffer.from(code);
    if (candidate.length === received.length && crypto.timingSafeEqual(candidate, received)) {
      return now + drift;
    }
  }
  return null;
};

/** Verifies a TOTP code and refuses to accept the same time step twice for a user. */
const verifyTotp = async (userId, secret, code) => {
  const counter = matchTotp(secret, code);
  if (counter === null) return false;
  const usedKey = `mfa:totp-used:${userId}:${counter}`;
  if (await getValue(usedKey)) return false;
  await setValue(usedKey, "1", (TOTP_WINDOW * 2 + 2) * TOTP_STEP_SECONDS * 1000);
  return true;
};

const generateSecret = () => base32Encode(crypto.randomBytes(20));

const otpauthUrl = (secret, accountName) => {
  const label = encodeURIComponent(`${ISSUER}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer: ISSUER,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
};

// ---------- Secret encryption at rest (AES-256-GCM) ----------

const encryptionKey = crypto.createHash("sha256").update(`mfa:${mfaEncryptionKey}`).digest();

const encryptSecret = (plain) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return ["v1", iv, cipher.getAuthTag(), encrypted]
    .map((part) => (typeof part === "string" ? part : part.toString("base64url")))
    .join(".");
};

const decryptSecret = (stored) => {
  const [version, iv, tag, data] = String(stored).split(".");
  if (version !== "v1") throw new Error("Unknown MFA secret format");
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    encryptionKey,
    Buffer.from(iv, "base64url")
  );
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(data, "base64url")),
    decipher.final(),
  ]).toString("utf8");
};

// ---------- Recovery codes ----------

const RECOVERY_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

const normalizeRecoveryCode = (code) =>
  String(code)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const hashRecoveryCode = (code) =>
  crypto.createHash("sha256").update(normalizeRecoveryCode(code)).digest("hex");

const generateRecoveryCodes = () => {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const chars = Array.from(
      { length: 10 },
      () => RECOVERY_ALPHABET[crypto.randomInt(RECOVERY_ALPHABET.length)]
    ).join("");
    return `${chars.slice(0, 5)}-${chars.slice(5)}`;
  });
  return { codes, hashes: codes.map(hashRecoveryCode) };
};

/** Returns the remaining hashes when the code is valid, or null. */
const useRecoveryCode = (hashes, code) => {
  const hash = hashRecoveryCode(code);
  const index = (hashes || []).indexOf(hash);
  if (index === -1) return null;
  return hashes.filter((_, position) => position !== index);
};

// ---------- Login challenges and pending setups ----------

const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const challengeKey = (token) => `mfa:challenge:${tokenHash(token)}`;
const challengeAttemptsKey = (token) => `mfa:challenge-attempts:${tokenHash(token)}`;

const createChallenge = async (user) => {
  const token = crypto.randomBytes(32).toString("base64url");
  await setValue(
    challengeKey(token),
    JSON.stringify({ userId: user.id, method: user.mfaMethod, email: user.email }),
    CHALLENGE_TTL_MS
  );
  return token;
};

const readChallenge = async (token) => {
  const raw = await getValue(challengeKey(token));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/** Counts an attempt; returns false (and drops the challenge) once the limit is passed. */
const countChallengeAttempt = async (token) => {
  const { count } = await increment(challengeAttemptsKey(token), CHALLENGE_TTL_MS);
  if (count > CHALLENGE_MAX_ATTEMPTS) {
    await removeKeys(challengeKey(token), challengeAttemptsKey(token));
    return false;
  }
  return true;
};

const finishChallenge = (token) => removeKeys(challengeKey(token), challengeAttemptsKey(token));

const pendingKey = (userId) => `mfa:pending-totp:${userId}`;

const savePendingSecret = (userId, secret) =>
  setValue(pendingKey(userId), encryptSecret(secret), PENDING_SETUP_TTL_MS);

const readPendingSecret = async (userId) => {
  const stored = await getValue(pendingKey(userId));
  if (!stored) return null;
  try {
    return decryptSecret(stored);
  } catch {
    return null;
  }
};

const clearPendingSecret = (userId) => removeKeys(pendingKey(userId));

module.exports = {
  ISSUER,
  hotp,
  matchTotp,
  verifyTotp,
  generateSecret,
  otpauthUrl,
  encryptSecret,
  decryptSecret,
  generateRecoveryCodes,
  useRecoveryCode,
  createChallenge,
  readChallenge,
  countChallengeAttempt,
  finishChallenge,
  savePendingSecret,
  readPendingSecret,
  clearPendingSecret,
  base32Encode,
  base32Decode,
};
