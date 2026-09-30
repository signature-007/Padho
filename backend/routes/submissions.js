const express = require("express");
const fs = require("fs");
const path = require("path");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const { protect, restrictTo } = require("../middleware/auth");
const upload = require("../middleware/upload");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { isUrl } = require("../utils/validate");
const assertCourseAccess = require("../utils/access");

const router = express.Router();
router.use(protect);

const removeFile = (file) =>
  file &&
  file.path &&
  fs.unlink(path.join(__dirname, "..", file.path), () => {});

// Student: submit (or re-submit until graded) text, link and/or file
router.post(
  "/assignments/:id/submissions",
  restrictTo("student"),
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const cleanup = () => req.file && fs.unlink(req.file.path, () => {});
    try {
      const assignment = await Assignment.findById(req.params.id);
      if (!assignment) throw new HttpError(404, "Assignment not found");
      await assertCourseAccess(req.user, assignment.course);

      const text = (req.body.text || "").trim();
      const link = (req.body.link || "").trim();
      const linkType = link ? req.body.linkType || "other" : "";
      if (!text && !link && !req.file)
        throw new HttpError(400, "Add text, a link or a file to submit");
      if (link && !isUrl(link))
        throw new HttpError(
          400,
          "Enter a valid link starting with http:// or https://",
        );
      if (!["github", "drive", "project", "other", ""].includes(linkType))
        throw new HttpError(400, "Invalid link type");

      const existing = await Submission.findOne({
        assignment: assignment._id,
        student: req.user._id,
      });
      if (existing && existing.status === "graded")
        throw new HttpError(
          400,
          "This submission has already been graded and can no longer be changed",
        );

      const data = {
        text,
        link,
        linkType,
        submissionDate: new Date(),
        isLate: new Date() > assignment.deadline,
        status: "submitted",
      };
      if (req.file)
        data.file = {
          path: `uploads/${req.file.filename}`,
          originalName: req.file.originalname,
        };

      let submission;
      if (existing) {
        if (req.file) removeFile(existing.file);
        else data.file = existing.file;
        existing.set(data);
        submission = await existing.save();
      } else {
        submission = await Submission.create({
          ...data,
          assignment: assignment._id,
          course: assignment.course,
          student: req.user._id,
        });
      }
      res.status(existing ? 200 : 201).json({ submission });
    } catch (err) {
      cleanup();
      throw err;
    }
  }),
);

// Student: my submissions with marks and feedback
router.get(
  "/submissions/mine",
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    const submissions = await Submission.find({ student: req.user._id })
      .sort("-submissionDate")
      .populate("assignment", "title maxMarks deadline")
      .populate("course", "title")
      .lean();
    res.json({
      submissions: submissions.filter((s) => s.assignment && s.course),
    });
  }),
);

// Admin: review queue. Filters: ?course= ?assignment= ?status=
router.get(
  "/submissions",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const filter = {};
    ["course", "assignment", "status"].forEach(
      (k) => req.query[k] && (filter[k] = req.query[k]),
    );
    const submissions = await Submission.find(filter)
      .sort("-submissionDate")
      .populate("student", "name email")
      .populate("assignment", "title maxMarks deadline")
      .populate("course", "title")
      .lean();
    res.json({
      submissions: submissions.filter(
        (s) => s.student && s.assignment && s.course,
      ),
    });
  }),
);

// Admin: marks, feedback, status
router.put(
  "/submissions/:id",
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const submission = await Submission.findById(req.params.id).populate(
      "assignment",
      "maxMarks",
    );
    if (!submission) throw new HttpError(404, "Submission not found");
    const { marks, feedback, status } = req.body;
    const hasMarks = marks !== undefined && marks !== null && marks !== "";
    if (hasMarks) {
      const n = Number(marks);
      if (!Number.isFinite(n) || n < 0 || n > submission.assignment.maxMarks)
        throw new HttpError(
          400,
          `Marks must be between 0 and ${submission.assignment.maxMarks}`,
        );
      submission.marks = n;
    }
    if (feedback !== undefined) submission.feedback = feedback;
    if (status !== undefined) {
      if (!["submitted", "under_review", "graded"].includes(status))
        throw new HttpError(400, "Invalid status");
      submission.status = status;
    } else if (hasMarks) {
      submission.status = "graded";
    }
    if (submission.status === "graded" && submission.marks === null)
      throw new HttpError(
        400,
        "Enter marks before marking a submission as graded",
      );
    await submission.save();
    res.json({ submission });
  }),
);

module.exports = router;
