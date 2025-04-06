const express = require("express");
const router = express.Router();
const Review = require("../Models/Review");

// POST a new review
router.post("/", async (req, res) => {
  const { courseId, title, rating, text, author = "Anonymous", contentRating, difficultyRating, workloadRating, professorRating } = req.body;

  if (!courseId || !rating || !text) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newReview = new Review({ courseId, title, rating, text, author, contentRating, difficultyRating, workloadRating, professorRating});
    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error saving review:", err);
    res.status(500).json({ error: "Server error." });
  }
});

// GET all reviews for a specific course
router.get("/:courseId", async (req, res) => {
  try {
    const reviews = await Review.find({ courseId: req.params.courseId }).sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Helpful Button
router.patch("/:id/helpful", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.helpfulCount++;
    await review.save();

    res.json({ helpfulCount: review.helpfulCount });
  } catch (err) {
    console.error("Error updating helpful count:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;