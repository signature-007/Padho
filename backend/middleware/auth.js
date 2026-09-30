const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function resolveUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  const { id } = jwt.verify(token, process.env.JWT_SECRET);
  return User.findById(id);
}

// Requires a valid JWT.
exports.protect = async (req, res, next) => {
  try {
    const user = await resolveUser(req);
    if (!user)
      return res.status(401).json({ message: "Please log in to continue" });
    req.user = user;
    next();
  } catch {
    res
      .status(401)
      .json({ message: "Session expired or invalid. Please log in again" });
  }
};

// Attaches req.user when a valid token is sent, but never blocks the request.
exports.optionalAuth = async (req, _res, next) => {
  try {
    req.user = (await resolveUser(req)) || undefined;
  } catch {
    req.user = undefined;
  }
  next();
};

// Role-based access control.
exports.restrictTo =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res
          .status(403)
          .json({ message: "You do not have access to this resource" });
