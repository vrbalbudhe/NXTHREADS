const { readSession } = require("./verifyToken");

const optionalAuth = async (req, res, next) => {
  try {
    const session = await readSession(req);
    if (session) {
      req.userId = session.userId;
      req.session = session;
    }
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = optionalAuth;
