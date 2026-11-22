const { verifySessionToken } = require("../lib/session");

const readSession = (req) => verifySessionToken(req.cookies?.token);

const verifyToken = async (req, res, next) => {
  try {
    const payload = await readSession(req);
    if (!payload) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    req.userId = payload.userId;
    req.session = payload;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = verifyToken;
module.exports.readSession = readSession;
module.exports.verifySessionToken = verifySessionToken;
