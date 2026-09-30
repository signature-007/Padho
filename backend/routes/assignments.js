const express = require("express");
const Course = require("../models/Course");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const { protect, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { required } = require("../utils/validate");
const assertCourseAccess = require("../utils/access");

const router = express.Router();
router.use(protect);

function cleanBody(body) {
  const deadline = new Date(body.deadline);
  if (Number.isNaN(deadline.getTime()))
    throw new HttpError(400, "Enter a valid deadline");
  const maxMarks =
    body.maxMarks === undefined || body.maxMarks === ""
      ? 100
      : Number(body.maxMarks);
  if (!Number.isFinite(maxMarks) || maxMarks < 1)
    throw new HttpError(400, "Maximum marks must be at least 1");
  return {
    title: body.title,
    description: body.description || "",
    instructions: body.instructions || "",
    deadline,
    maxMarks,
  };
}

// Student: all assignments from enrolled courses with my submission status
router.get(
  "/assignments/mine",
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id }).select(
      "course",
    );
    const courseIds = enrollments.map((e) => e.course);
    const [assignments, subs] = await Promise.all([
      Assignment.find({ course: { $in: courseIds } })
        .sort("deadline")
        .populate("course", "title")
        .lean(),
      Submission.find({ student: req.user._id }).lean(),
    ]);
    const byAssignment = Object.fromEntries(
      subs.map((s) => [String(s.assignment), s]),
    );
    res.json({
      assignments: assignments
        .filter((a) => a.course)
        .map((a) => ({
          ...a,
          submission: byAssignment[String(a._id)] || null,
        })),
    });
  }),
);

// Admin: all assignments with submission counts
router.get(
  "/assignments",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const filter = req.query.course ? { course: req.query.course } : {};
    const assignments = await Assignment.find(filter)
      .sort("-deadline")
      .populate("course", "title")
      .lean();
    const counts = await Submission.aggregate([
      { $group: { _id: "$assignment", n: { $sum: 1 } } },
    ]);
    const map = Object.fromEntries(counts.map((c) => [String(c._id), c.n]));
    res.json({
      assignments: assignments
        .filter((a) => a.course)
        .map((a) => ({ ...a, submissionCount: map[String(a._id)] || 0 })),
    });
  }),
);

router.get(
  "/assignments/:id",
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findById(req.params.id)
      .populate("course", "title")
      .lean();
    if (!assignment) throw new HttpError(404, "Assignment not found");
    await assertCourseAccess(req.user, assignment.course._id);
    const submission =
      req.user.role === "student"
        ? await Submission.findOne({
            assignment: assignment._id,
            student: req.user._id,
          }).lean()
        : null;
    res.json({ assignment, submission });
  }),
);

router.get(
  "/courses/:courseId/assignments",
  asyncHandler(async (req, res) => {
    if (!(await Course.exists({ _id: req.params.courseId })))
      throw new HttpError(404, "Course not found");
    await assertCourseAccess(req.user, req.params.courseId);
    const assignments = await Assignment.find({ course: req.params.courseId })
      .sort("deadline")
      .lean();
    let byAssignment = {};
    if (req.user.role === "student") {
      const subs = await Submission.find({
        student: req.user._id,
        course: req.params.courseId,
      }).lean();
      byAssignment = Object.fromEntries(
        subs.map((s) => [String(s.assignment), s]),
      );
    }
    res.json({
      assignments: assignments.map((a) => ({
        ...a,
        submission: byAssignment[String(a._id)] || null,
      })),
    });
  }),
);

router.post(
  "/courses/:courseId/assignments",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title", "deadline"]);
    if (!(await Course.exists({ _id: req.params.courseId })))
      throw new HttpError(404, "Course not found");
    const assignment = await Assignment.create({
      ...cleanBody(req.body),
      course: req.params.courseId,
    });
    res.status(201).json({ assignment });
  }),
);

router.put(
  "/assignments/:id",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title", "deadline"]);
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      cleanBody(req.body),
      { new: true, runValidators: true },
    );
    if (!assignment) throw new HttpError(404, "Assignment not found");
    res.json({ assignment });
  }),
);

router.delete(
  "/assignments/:id",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) throw new HttpError(404, "Assignment not found");
    await Submission.deleteMany({ assignment: assignment._id });
    res.json({ message: "Assignment deleted" });
  }),
);

module.exports = router;
