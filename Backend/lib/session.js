const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn, sessionMaxAgeMs, sessionCookieOptions } = require("../Config/env");
const { getValue, setValue } = require("./store");

const revokedKey = (jti) => `session:revoked:${jti}`;
const validAfterKey = (userId) => `session:valid-after:${userId}`;

const issueSession = (res, user) => {
  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      gender: user.gender,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn, algorithm: "HS256", jwtid: crypto.randomUUID() }
  );
  res.cookie("token", token, { ...sessionCookieOptions, maxAge: sessionMaxAgeMs });
  return token;
};

const clearSessionCookie = (res) => res.clearCookie("token", sessionCookieOptions);

const isRevoked = async (payload) => {
  const [revoked, validAfter] = await Promise.all([
    payload.jti ? getValue(revokedKey(payload.jti)) : null,
    getValue(validAfterKey(payload.userId)),
  ]);
  if (revoked) return true;
  return Boolean(validAfter) && payload.iat < Number(validAfter);
};

const verifySessionToken = async (token) => {
  if (!token || typeof token !== "string") return null;
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
  if (!payload?.userId || !payload.jti) return null;
  return (await isRevoked(payload)) ? null : payload;
};

const revokeSession = async (payload) => {
  if (!payload?.jti || !payload.exp) return;
  const remaining = payload.exp * 1000 - Date.now();
  if (remaining > 0) await setValue(revokedKey(payload.jti), "1", remaining);
};

const revokeAllSessions = (userId) =>
  setValue(validAfterKey(userId), String(Math.floor(Date.now() / 1000)), sessionMaxAgeMs);

module.exports = {
  issueSession,
  clearSessionCookie,
  verifySessionToken,
  revokeSession,
  revokeAllSessions,
};
