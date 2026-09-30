const multer = require("multer");

exports.notFound = (req, res) =>
  res
    .status(404)
    .json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message || "Server error";

  if (err instanceof multer.MulterError) {
    status = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large (max 5 MB)"
        : err.message;
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  } else if (err.name === "CastError") {
    status = 404;
    message = "Resource not found";
  } else if (err.code === 11000) {
    status = 409;
    message = "A record with these details already exists";
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ message });
};
