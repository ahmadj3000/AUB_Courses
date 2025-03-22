const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, default: "" }
});

module.exports = mongoose.models.Course || mongoose.model("Course", courseSchema);
