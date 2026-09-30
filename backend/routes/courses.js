const express = require("express");
const fs = require("fs");
const path = require("path");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const { protect, optionalAuth, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { required, escapeRegex } = require("../utils/validate");

const router = express.Router();
const FIELDS = [
  "title",
  "description",
  "category",
  "instructor",
  "duration",
  "difficulty",
  "image",
];
const pick = (body) =>
  Object.fromEntries(
    FIELDS.filter((f) => body[f] !== undefined).map((f) => [f, body[f]]),
  );

const countBy = (Model, ids) =>
  Model.aggregate([
    { $match: { course: { $in: ids } } },
    { $group: { _id: "$course", n: { $sum: 1 } } },
  ]).then((rows) => Object.fromEntries(rows.map((r) => [String(r._id), r.n])));

// Public: list + search/filter
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, difficulty } = req.query;
    const filter = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), "i");
      filter.$or = [{ title: rx }, { description: rx }, { instructor: rx }];
    }
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    const courses = await Course.find(filter).sort("-createdAt").lean();
    const ids = courses.map((c) => c._id);
    const [modules, enrollments] = await Promise.all([
      countBy(Module, ids),
      countBy(Enrollment, ids),
    ]);
    res.json({
      courses: courses.map((c) => ({
        ...c,
        moduleCount: modules[String(c._id)] || 0,
        enrollmentCount: enrollments[String(c._id)] || 0,
      })),
    });
  }),
);

router.get(
  "/categories",
  asyncHandler(async (_req, res) =>
    res.json({ categories: (await Course.distinct("category")).sort() }),
  ),
);

// Public course details; includes the student's enrollment when logged in.
router.get(
  "/:id",
  optionalAuth,
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id).lean();
    if (!course) throw new HttpError(404, "Course not found");
    const [modules, assignmentCount, enrollmentCount] = await Promise.all([
      Module.find({ course: course._id })
        .sort("order")
        .select("title order")
        .lean(),
      Assignment.countDocuments({ course: course._id }),
      Enrollment.countDocuments({ course: course._id }),
    ]);
    let enrollment = null;
    if (req.user && req.user.role === "student")
      enrollment = await Enrollment.findOne({
        course: course._id,
        student: req.user._id,
      }).lean();
    res.json({
      course: { ...course, assignmentCount, enrollmentCount },
      modules,
      enrollment,
    });
  }),
);

router.post(
  "/",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title", "description", "category", "instructor"]);
    res.status(201).json({ course: await Course.create(pick(req.body)) });
  }),
);

router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title", "description", "category", "instructor"]);
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      pick(req.body),
      { new: true, runValidators: true },
    );
    if (!course) throw new HttpError(404, "Course not found");
    res.json({ course });
  }),
);

// Deleting a course removes everything that belongs to it.
router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new HttpError(404, "Course not found");
    const subs = await Submission.find({
      course: course._id,
      "file.path": { $exists: true },
    });
    subs.forEach(
      (s) =>
        s.file &&
        s.file.path &&
        fs.unlink(path.join(__dirname, "..", s.file.path), () => {}),
    );
    await Promise.all([
      Module.deleteMany({ course: course._id }),
      Assignment.deleteMany({ course: course._id }),
      Submission.deleteMany({ course: course._id }),
      Enrollment.deleteMany({ course: course._id }),
    ]);
    await course.deleteOne();
    res.json({ message: "Course deleted" });
  }),
);

module.exports = router;
