const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrollmentDate: { type: Date, default: Date.now },
  completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Module" }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: { type: String, enum: ["active", "completed"], default: "active" },
  completedAt: Date,
});

// One enrollment per student per course – prevents duplicate records.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
