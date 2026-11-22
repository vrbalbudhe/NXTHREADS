const { firstIssueMessage } = require("../lib/schemas");

const PARTS = ["params", "query", "body"];

const validate = (schemas) => (req, res, next) => {
  const valid = {};
  for (const part of PARTS) {
    if (!schemas[part]) {
      continue;
    }
    const result = schemas[part].safeParse(req[part] ?? {});
    if (!result.success) {
      return res.status(400).json({ success: false, message: firstIssueMessage(result.error) });
    }
    valid[part] = result.data;
  }
  req.valid = valid;
  return next();
};

module.exports = validate;
