const express = require("express");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");
const { protect, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { required } = require("../utils/validate");

const router = express.Router();
router.use(protect);

router.post(
  "/",
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    required(req.body, ["courseId"]);
    if (!(await Course.exists({ _id: req.body.courseId })))
      throw new HttpError(404, "Course not found");
    if (
      await Enrollment.exists({
        student: req.user._id,
        course: req.body.courseId,
      })
    )
      throw new HttpError(409, "You are already enrolled in this course");
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: req.body.courseId,
    });
    res.status(201).json({ enrollment });
  }),
);

// My Courses
router.get(
  "/me",
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    const list = await Enrollment.find({ student: req.user._id })
      .sort("-enrollmentDate")
      .populate("course")
      .lean();
    const enrollments = list.filter((e) => e.course);
    const counts = await Module.aggregate([
      { $match: { course: { $in: enrollments.map((e) => e.course._id) } } },
      { $group: { _id: "$course", n: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json({
      enrollments: enrollments.map((e) => ({
        ...e,
        moduleCount: map[String(e.course._id)] || 0,
      })),
    });
  }),
);

// Admin: every enrollment (used by Student Progress). Optional ?course=<id>
router.get(
  "/",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const filter = req.query.course ? { course: req.query.course } : {};
    const enrollments = await Enrollment.find(filter)
      .sort("-enrollmentDate")
      .populate("student", "name email")
      .populate("course", "title")
      .lean();
    res.json({ enrollments: enrollments.filter((e) => e.student && e.course) });
  }),
);

module.exports = router;
