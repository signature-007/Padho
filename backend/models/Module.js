const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["notes", "pdf", "video", "reference", "code", "exercise", "link"],
      default: "link",
    },
    url: { type: String, required: true, trim: true },
  },
  { _id: true },
);

const moduleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    notes: { type: String, default: "" },
    resources: [resourceSchema],
    order: { type: Number, default: 1 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Module", moduleSchema);
