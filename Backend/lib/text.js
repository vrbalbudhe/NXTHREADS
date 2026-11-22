const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\/-]/g, "\\$&");

const containsText = (value) => ({ contains: escapeRegex(value), mode: "insensitive" });

module.exports = { escapeRegex, containsText };
