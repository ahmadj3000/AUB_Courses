const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Material = require("../Models/Material");

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get("/", async (req, res) => {
  const courseId = req.query.course;
  const materials = await Material.find({ courseId });
  res.json(materials);
});

router.post("/", upload.single("file"), async (req, res) => {
  const { courseId, title, type, description, uploadedBy } = req.body;
  const filePath = `/uploads/${req.file.filename}`;
  const newMat = new Material({
    courseId,
    title,
    type: req.body.type,
    description,
    uploadedBy,
    url: filePath
  });
  await newMat.save();
  res.status(201).json({ message: "Material uploaded" });
});

module.exports = router;
