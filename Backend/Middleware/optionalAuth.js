const { readSession } = require("./verifyToken");

const optionalAuth = (req, res, next) => {
  const session = readSession(req);
  if (session) {
    req.userId = session.userId;
    req.session = session;
  }
  return next();
};

module.exports = optionalAuth;
