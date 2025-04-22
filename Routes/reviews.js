const express = require("express");
const router = express.Router();
const Review = require("../Models/Review");

// POST a new review
router.post("/", async (req, res) => {
  const {
    courseId,
    userId,
    title,
    rating,
    text,
    contentRating,
    difficultyRating,
    workloadRating,
    professorRating
  } = req.body;

  if (!courseId || !userId || !rating || !text) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existing = await Review.findOne({ courseId, userId });
    if (existing) {
      return res.status(400).json({ error: "You've already submitted a review for this course." });
    }

    const newReview = new Review({
      courseId,
      userId,
      title,
      rating,
      text,
      contentRating,
      difficultyRating,
      workloadRating,
      professorRating
    });

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
    const reviews = await Review.find({ courseId: req.params.courseId })
      .populate("userId", "username")
      .sort({ date: -1 });

    res.json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET all reviews (for admin panel)
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find().sort({ date: -1 });
    res.json(reviews);
  } catch (err) {
    console.error("Error fetching all reviews:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE a review by ID
router.delete("/:id", async (req, res) => {
  try {
    const result = await Review.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Review not found" });
    }
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
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





