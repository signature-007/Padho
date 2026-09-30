const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { required, isEmail } = require("../utils/validate");

const router = express.Router();

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// Public registration always creates a student. Admins are created via `npm run seed`.
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    required(req.body, ["name", "email", "password"]);
    const { name, email, password } = req.body;
    if (!isEmail(email))
      throw new HttpError(400, "Enter a valid email address");
    if (String(password).length < 6)
      throw new HttpError(400, "Password must be at least 6 characters");
    if (await User.findOne({ email: String(email).toLowerCase() }))
      throw new HttpError(409, "An account with this email already exists");
    const user = await User.create({ name, email, password, role: "student" });
    res.status(201).json({ token: sign(user), user });
  }),
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    required(req.body, ["email", "password"]);
    const user = await User.findOne({
      email: String(req.body.email).toLowerCase(),
    }).select("+password");
    if (!user || !(await user.matchPassword(req.body.password)))
      throw new HttpError(401, "Incorrect email or password");
    res.json({ token: sign(user), user });
  }),
);

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

router.put(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");
    if (name !== undefined) {
      if (!String(name).trim())
        throw new HttpError(400, "Name cannot be empty");
      user.name = name;
    }
    if (newPassword) {
      if (!currentPassword || !(await user.matchPassword(currentPassword)))
        throw new HttpError(400, "Current password is incorrect");
      if (String(newPassword).length < 6)
        throw new HttpError(400, "New password must be at least 6 characters");
      user.password = newPassword;
    }
    await user.save();
    res.json({ user });
  }),
);

module.exports = router;
