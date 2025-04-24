const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: String,
  content: String,
  courseId: String,
  author: { type: String, default: "Anonymous" },
  date: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  answers: [
    {
      content: String,
      author: { type: String, default: 'Anonymous' },
      date: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Post", PostSchema);
