const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const isObjectId = (value) => typeof value === "string" && OBJECT_ID_PATTERN.test(value);

const cleanString = (value) => (typeof value === "string" ? value.trim() : "");

const isHttpUrl = (value) => {
  if (typeof value !== "string") {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

const invalidId = (res, label = "id") =>
  res.status(400).json({ success: false, message: `Invalid ${label}` });

module.exports = { isObjectId, cleanString, isHttpUrl, invalidId };
