const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const verifyToken = asyncHandler(async (req, res, next, err) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({
      message: "User is Not Authenticated",
      success: false,
    });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).json({
        message: "User is Not Authenticated",
        success: false,
      });
    }
    req.userId = payload.userId; // Important Statement
    next();
  });
});

module.exports = verifyToken;
