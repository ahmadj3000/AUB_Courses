const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  title: String,
  department: String,
  credits: Number,
  rating: Number,
  professors: [String],
  description: String
});

module.exports = mongoose.models.Course || mongoose.model("Course", CourseSchema);
