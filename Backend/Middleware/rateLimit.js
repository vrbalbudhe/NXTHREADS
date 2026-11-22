const { increment } = require("../lib/store");

const createRateLimiter =
  ({ windowMs, max, message }) =>
  async (req, res, next) => {
    try {
      const route = `${req.baseUrl}${req.route?.path || req.path}`;
      const { count, resetInMs } = await increment(`ratelimit:${route}:${req.ip}`, windowMs);
      res.set("RateLimit-Limit", String(max));
      res.set("RateLimit-Remaining", String(Math.max(0, max - count)));
      if (count > max) {
        res.set("Retry-After", String(Math.max(1, Math.ceil(resetInMs / 1000))));
        return res.status(429).json({ success: false, message });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = createRateLimiter;
