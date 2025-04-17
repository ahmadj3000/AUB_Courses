const express = require("express");
const router = express.Router();
const Course = require("../Models/Course");

// GET all courses
router.get("/", async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});



// POST a new course
router.post("/", async (req, res) => {
  const courseData = req.body;
  try {
    const course = new Course(courseData);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: "Failed to create course", details: err.message });
  }
});

// DELETE a course by ID
router.delete("/:id", async (req, res) => {
  try {
    const result = await Course.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course", details: err.message });
  }
});

module.exports = router;






