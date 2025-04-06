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

module.exports = router;
