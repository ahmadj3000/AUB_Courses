const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema({
  courseId: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: Number,
  title: String,
  text: String,
  author: { type: String, default: "Anonymous" },
  date: { type: Date, default: Date.now },
  contentRating: Number,
  difficultyRating: Number,
  workloadRating: Number,
  professorRating: Number,
  helpfulCount: {
    type: Number,
    default: 0
  }
    
});

module.exports = mongoose.model("Review", ReviewSchema);
