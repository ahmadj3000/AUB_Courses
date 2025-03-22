const express = require("express");
const router = express.Router();
const Course = require("../models/Course");

// POST: Add a new course
router.post("/", async (req, res) => {
  const { code, title } = req.body;

  if (!code) return res.status(400).json({ error: "Course code is required" });

  try {
    const existing = await Course.findOne({ code });
    if (existing) return res.status(409).json({ error: "Course already exists" });

    const course = new Course({ code, title });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET: Fetch all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    console.error("❌ Error fetching courses:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

// ✅ Get materials by course
router.get("/course/:courseCode", async (req, res) => {
    try {
      const courseCode = req.params.courseCode.toUpperCase();
      const materials = await Material.find({ courseCode });
      res.json(materials);
    } catch (error) {
      console.error("Error fetching course materials:", error);
      res.status(500).json({ error: "Failed to fetch materials for this course." });
    }
  });
  