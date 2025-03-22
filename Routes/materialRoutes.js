const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Material = require("../Models/Material");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Route: Upload Material
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { title, description, courseCode, type } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const newMaterial = new Material({
      title,
      courseCode,
      type,
      description,
      fileUrl
    });

    await newMaterial.save(); // ✅ Save the instance

    res.status(201).json({ message: "✅ Material uploaded", material: newMaterial });
  } catch (err) {
    console.error("❌ Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route: Get materials by course
router.get("/course/:courseCode", async (req, res) => {
  try {
    const materials = await Material.find({ courseCode: req.params.courseCode.toUpperCase() });
    res.json(materials);
  } catch (err) {
    console.error("Failed to fetch materials by course:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
