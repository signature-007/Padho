const express = require("express");
const Course = require("../models/Course");
const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");
const { protect, restrictTo } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { required, isUrl } = require("../utils/validate");
const assertCourseAccess = require("../utils/access");
const { recalc, recalcCourse } = require("../utils/progress");

const router = express.Router();

function cleanBody(body) {
  const data = {
    title: body.title,
    description: body.description || "",
    notes: body.notes || "",
  };
  if (body.order !== undefined && body.order !== "")
    data.order = Number(body.order);
  if (data.order !== undefined && Number.isNaN(data.order))
    throw new HttpError(400, "Order must be a number");
  if (body.resources !== undefined) {
    const list = Array.isArray(body.resources) ? body.resources : [];
    data.resources = list
      .filter((r) => r && (r.label || r.url))
      .map((r) => {
        if (!r.label || !r.url)
          throw new HttpError(400, "Each resource needs a label and a URL");
        if (!isUrl(r.url))
          throw new HttpError(
            400,
            `Resource link is not a valid URL: ${r.url}`,
          );
        return { label: r.label, url: r.url, type: r.type || "link" };
      });
  }
  return data;
}

router.get(
  "/courses/:courseId/modules",
  protect,
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.courseId);
    if (!course) throw new HttpError(404, "Course not found");
    const enrollment = await assertCourseAccess(req.user, course._id);
    const modules = await Module.find({ course: course._id }).sort(
      "order createdAt",
    );
    res.json({ course, modules, enrollment });
  }),
);

router.post(
  "/courses/:courseId/modules",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title"]);
    if (!(await Course.exists({ _id: req.params.courseId })))
      throw new HttpError(404, "Course not found");
    const data = cleanBody(req.body);
    if (data.order === undefined)
      data.order =
        (await Module.countDocuments({ course: req.params.courseId })) + 1;
    const module = await Module.create({
      ...data,
      course: req.params.courseId,
    });
    await recalcCourse(req.params.courseId);
    res.status(201).json({ module });
  }),
);

router.put(
  "/modules/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    required(req.body, ["title"]);
    const module = await Module.findByIdAndUpdate(
      req.params.id,
      cleanBody(req.body),
      { new: true, runValidators: true },
    );
    if (!module) throw new HttpError(404, "Module not found");
    res.json({ module });
  }),
);

router.delete(
  "/modules/:id",
  protect,
  restrictTo("admin"),
  asyncHandler(async (req, res) => {
    const module = await Module.findByIdAndDelete(req.params.id);
    if (!module) throw new HttpError(404, "Module not found");
    await recalcCourse(module.course);
    res.json({ message: "Module deleted" });
  }),
);

// Student marks a module complete / incomplete -> progress is recalculated.
router.post(
  "/modules/:id/toggle-complete",
  protect,
  restrictTo("student"),
  asyncHandler(async (req, res) => {
    const module = await Module.findById(req.params.id);
    if (!module) throw new HttpError(404, "Module not found");
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: module.course,
    });
    if (!enrollment) throw new HttpError(403, "Enroll in this course first");
    const has = enrollment.completedModules.some(
      (m) => String(m) === String(module._id),
    );
    enrollment.completedModules = has
      ? enrollment.completedModules.filter(
          (m) => String(m) !== String(module._id),
        )
      : [...enrollment.completedModules, module._id];
    await recalc(enrollment);
    res.json({ enrollment });
  }),
);

module.exports = router;
