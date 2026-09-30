const Enrollment = require("../models/Enrollment");
const HttpError = require("./httpError");

// Admins can open any course; students only the ones they are enrolled in.
module.exports = async function assertCourseAccess(user, courseId) {
  if (user.role === "admin") return null;
  const enrollment = await Enrollment.findOne({
    student: user._id,
    course: courseId,
  });
  if (!enrollment)
    throw new HttpError(403, "Enroll in this course to access its content");
  return enrollment;
};
