const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String, default: "" },
  link: { type: String, default: "" }, // GitHub / Drive / project URL
  linkType: {
    type: String,
    enum: ["github", "drive", "project", "other", ""],
    default: "",
  },
  file: { path: String, originalName: String },
  submissionDate: { type: Date, default: Date.now },
  isLate: { type: Boolean, default: false },
  marks: { type: Number, default: null },
  feedback: { type: String, default: "" },
  status: {
    type: String,
    enum: ["submitted", "under_review", "graded"],
    default: "submitted",
  },
});

// A student has one (re-submittable) submission per assignment.
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
