const Module = require("../models/Module");
const Enrollment = require("../models/Enrollment");

async function recalc(enrollment) {
  const modules = await Module.find({ course: enrollment.course }).select(
    "_id",
  );
  const valid = new Set(modules.map((m) => String(m._id)));
  enrollment.completedModules = enrollment.completedModules.filter((id) =>
    valid.has(String(id)),
  );
  const total = valid.size;
  enrollment.progress = total
    ? Math.round((enrollment.completedModules.length / total) * 100)
    : 0;
  const done = total > 0 && enrollment.progress === 100;
  enrollment.status = done ? "completed" : "active";
  enrollment.completedAt = done
    ? enrollment.completedAt || new Date()
    : undefined;
  await enrollment.save();
  return enrollment;
}

async function recalcCourse(courseId) {
  const list = await Enrollment.find({ course: courseId });
  for (const e of list) await recalc(e);
}

module.exports = { recalc, recalcCourse };
