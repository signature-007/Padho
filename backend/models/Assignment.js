const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    instructions: { type: String, default: "" },
    deadline: { type: Date, required: true },
    maxMarks: { type: Number, default: 100, min: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", assignmentSchema);
