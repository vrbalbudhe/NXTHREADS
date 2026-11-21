const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../Config/env");

const verifySessionToken = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }
  try {
    const payload = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
    return payload?.userId ? payload : null;
  } catch {
    return null;
  }
};

const readSession = (req) => verifySessionToken(req.cookies?.token);

const verifyToken = (req, res, next) => {
  const payload = readSession(req);
  if (!payload) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }
  req.userId = payload.userId;
  req.session = payload;
  return next();
};

module.exports = verifyToken;
module.exports.readSession = readSession;
module.exports.verifySessionToken = verifySessionToken;
