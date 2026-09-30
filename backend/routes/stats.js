const express = require("express");
const User = require("../models/User");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");
const Submission = require("../models/Submission");
const { protect, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();
router.use(protect);

router.get(
  "/admin",
  restrictTo("admin"),
  asyncHandler(async (_req, res) => {
    const [
      students,
      courses,
      modules,
      assignments,
      submissions,
      enrollments,
      pendingReviews,
      allEnrollments,
      recentSubmissions,
      recentEnrollments,
      allCourses,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      Course.countDocuments(),
      Module.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments(),
      Enrollment.countDocuments(),
      Submission.countDocuments({ status: { $ne: "graded" } }),
      Enrollment.find().select("progress status course").lean(),
      Submission.find()
        .sort("-submissionDate")
        .limit(5)
        .populate("student", "name")
        .populate("assignment", "title")
        .lean(),
      Enrollment.find()
        .sort("-enrollmentDate")
        .limit(5)
        .populate("student", "name")
        .populate("course", "title")
        .lean(),
      Course.find().select("title").lean(),
    ]);
    // Progress statistics are computed in JS (keeps the queries simple and portable).
    const totalProgress = allEnrollments.reduce(
      (sum, e) => sum + e.progress,
      0,
    );
    const completedEnrollments = allEnrollments.filter(
      (e) => e.status === "completed",
    ).length;
    const byCourse = {};
    allEnrollments.forEach((e) => {
      const k = String(e.course);
      byCourse[k] = byCourse[k] || { enrolled: 0, total: 0 };
      byCourse[k].enrolled += 1;
      byCourse[k].total += e.progress;
    });
    const popularCourses = allCourses
      .filter((c) => byCourse[String(c._id)])
      .map((c) => ({
        _id: c._id,
        title: c.title,
        enrolled: byCourse[String(c._id)].enrolled,
        avgProgress: Math.round(
          byCourse[String(c._id)].total / byCourse[String(c._id)].enrolled,
        ),
      }))
      .sort((a, b) => b.enrolled - a.enrolled)
      .slice(0, 5);
    res.json({
      totals: {
        students,
        courses,
        modules,
        assignments,
        submissions,
        enrollments,
        pendingReviews,
      },
      averageProgress: allEnrollments.length
        ? Math.round(totalProgress / allEnrollments.length)
        : 0,
      completedEnrollments,
      recentSubmissions: recentSubmissions.filter(
        (s) => s.student && s.assignment,
      ),
      recentEnrollments: recentEnrollments.filter((e) => e.student && e.course),
      popularCourses,
    });
  }),
);

router.get(
  "/student",
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .populate("course", "title")
      .lean();
    const courseIds = enrollments
      .map((e) => e.course && e.course._id)
      .filter(Boolean);
    const [assignments, submissions] = await Promise.all([
      Assignment.find({ course: { $in: courseIds } })
        .sort("deadline")
        .populate("course", "title")
        .lean(),
      Submission.find({ student: req.user._id })
        .sort("-submissionDate")
        .populate("assignment", "title")
        .lean(),
    ]);
    const submitted = new Set(
      submissions.map((s) => String(s.assignment && s.assignment._id)),
    );
    const pending = assignments.filter(
      (a) => a.course && !submitted.has(String(a._id)),
    );
    const valid = enrollments.filter((e) => e.course);
    const activity = [
      ...valid.map((e) => ({
        type: "enrolled",
        text: `Enrolled in ${e.course.title}`,
        date: e.enrollmentDate,
      })),
      ...valid
        .filter((e) => e.completedAt)
        .map((e) => ({
          type: "completed",
          text: `Completed ${e.course.title}`,
          date: e.completedAt,
        })),
      ...submissions
        .filter((s) => s.assignment)
        .map((s) => ({
          type: "submitted",
          text: `Submitted ${s.assignment.title}`,
          date: s.submissionDate,
        })),
      ...submissions
        .filter((s) => s.assignment && s.status === "graded")
        .map((s) => ({
          type: "graded",
          text: `${s.assignment.title} graded: ${s.marks} marks`,
          date: s.submissionDate,
        })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
    res.json({
      enrolledCount: valid.length,
      completedCount: valid.filter((e) => e.status === "completed").length,
      overallProgress: valid.length
        ? Math.round(valid.reduce((s, e) => s + e.progress, 0) / valid.length)
        : 0,
      pendingAssignments: pending
        .slice(0, 6)
        .map((a) => ({
          _id: a._id,
          title: a.title,
          deadline: a.deadline,
          course: a.course.title,
        })),
      pendingCount: pending.length,
      gradedCount: submissions.filter((s) => s.status === "graded").length,
      enrollments: valid.map((e) => ({
        _id: e._id,
        courseId: e.course._id,
        title: e.course.title,
        progress: e.progress,
        status: e.status,
      })),
      recentActivity: activity,
    });
  }),
);

module.exports = router;
