const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../Config/env");

const readSession = (req) => {
  const token = req.cookies?.token;
  if (!token) {
    return null;
  }
  try {
    return jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
  } catch {
    return null;
  }
};

const verifyToken = (req, res, next) => {
  const payload = readSession(req);
  if (!payload?.userId) {
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
