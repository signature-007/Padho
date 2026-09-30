const HttpError = require("./httpError");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.isEmail = (v) => EMAIL_RE.test(String(v || ""));

exports.isUrl = (v) => {
  try {
    const u = new URL(String(v));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// Throws 400 when any of the listed fields is missing/blank.
exports.required = (body, fields) => {
  const missing = fields.filter(
    (f) =>
      body[f] === undefined ||
      body[f] === null ||
      String(body[f]).trim() === "",
  );
  if (missing.length)
    throw new HttpError(
      400,
      `Missing required field(s): ${missing.join(", ")}`,
    );
};

exports.escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
