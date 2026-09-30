const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    instructor: { type: String, required: true, trim: true },
    duration: { type: String, default: "" }, // e.g. "6 weeks"
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    image: { type: String, default: "" }, // image URL (optional)
  },
  { timestamps: true },
);

module.exports = mongoose.model("Course", courseSchema);
