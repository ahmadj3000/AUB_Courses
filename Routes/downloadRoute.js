const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");

// Serve a download endpoint
router.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);

  if (fs.existsSync(filePath)) {
    res.download(filePath, filename); // Force download
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

module.exports = router;
