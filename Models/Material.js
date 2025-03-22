const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
    uppercase: true, // Ensures things like "cmps 201" become "CMPS 201"
  },
  type: {
    type: String,
    enum: ["Materials", "Previouses"], // Optional: limit to specific values
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Material", MaterialSchema);
