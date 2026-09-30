const express = require("express");
const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const { protect, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const router = express.Router();
router.use(protect, restrictTo("admin"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const [students, stats, subs] = await Promise.all([
      User.find({ role: "student" }).sort("-createdAt").lean(),
      Enrollment.find().select("student progress").lean(),
      Submission.aggregate([{ $group: { _id: "$student", n: { $sum: 1 } } }]),
    ]);
    const s = {};
    stats.forEach((e) => {
      const k = String(e.student);
      s[k] = s[k] || { enrollments: 0, total: 0 };
      s[k].enrollments += 1;
      s[k].total += e.progress;
    });
    const c = Object.fromEntries(subs.map((x) => [String(x._id), x.n]));
    res.json({
      students: students.map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        enrollments: (s[String(u._id)] || {}).enrollments || 0,
        avgProgress: s[String(u._id)]
          ? Math.round(s[String(u._id)].total / s[String(u._id)].enrollments)
          : 0,
        submissions: c[String(u._id)] || 0,
      })),
    });
  }),
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "student")
      throw new HttpError(404, "Student not found");
    const subs = await Submission.find({ student: user._id });
    subs.forEach(
      (x) =>
        x.file &&
        x.file.path &&
        fs.unlink(path.join(__dirname, "..", x.file.path), () => {}),
    );
    await Promise.all([
      Submission.deleteMany({ student: user._id }),
      Enrollment.deleteMany({ student: user._id }),
    ]);
    await user.deleteOne();
    res.json({ message: "Student removed" });
  }),
);

module.exports = router;
