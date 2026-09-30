const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const HttpError = require("../utils/httpError");

const ALLOWED = [
  ".pdf",
  ".doc",
  ".docx",
  ".ppt",
  ".pptx",
  ".txt",
  ".zip",
  ".png",
  ".jpg",
  ".jpeg",
  ".md",
];

module.exports = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (_req, file, cb) =>
      cb(
        null,
        `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${path.extname(file.originalname).toLowerCase()}`,
      ),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    ALLOWED.includes(ext)
      ? cb(null, true)
      : cb(new HttpError(400, `File type ${ext || "(none)"} is not allowed`));
  },
});
