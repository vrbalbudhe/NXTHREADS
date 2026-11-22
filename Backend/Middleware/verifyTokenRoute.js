const { readSession } = require("./verifyToken");

const IsLoginCall = (req, res) => {
  const payload = readSession(req);
  if (!payload?.userId) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }
  const { iat: _iat, exp: _exp, ...user } = payload;
  return res.status(200).json({
    success: true,
    message: "User is logged in",
    payload: user,
  });
};

module.exports = IsLoginCall;
