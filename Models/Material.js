const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  courseId: String,
  title: String,
  type: String,
  description: String,
  uploadedBy: String,
  uploadedAt: { type: Date, default: Date.now },
  url: String
});

module.exports = mongoose.model("Material", MaterialSchema);
