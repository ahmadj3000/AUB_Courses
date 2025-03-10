const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Middleware to parse form data (for non-file parts)
app.use(express.urlencoded({ extended: true }));

// Configure multer to store files in the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Prepend a timestamp to the original filename to prevent collisions
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Example in-memory storage for courses and their documents
const courses = {
  // Example course with an ID "course1"
  course1: {
    name: "Introduction to Programming",
    documents: [
      // Preexisting documents can be listed here
      // { title: "Syllabus.pdf", image: "/uploads/1634567890123-Syllabus.pdf", uploadedAt: new Date() }
    ]
  }
  // Add more courses as needed
};

// Endpoint to handle file uploads.
// Assume the course id is sent as part of the form data (req.body.courseId).
app.post('/upload', upload.single('file'), (req, res) => {
  const courseId = req.body.courseId || 'course1'; // default to course1 if not provided
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  // Create a document object with file metadata
  const newDoc = {
    title: file.originalname,
    image: `/uploads/${file.filename}`,
    uploadedAt: new Date()
  };

  // Associate the file with the proper course
  if (courses[courseId]) {
    courses[courseId].documents.push(newDoc);
  } else {
    // If the course doesn't exist, create it or return an error.
    return res.status(404).json({ message: "Course not found" });
  }

  res.json({ message: "File uploaded successfully", document: newDoc });
});

// Endpoint to fetch documents for a specific course.
app.get('/documents/:courseId', (req, res) => {
  const courseId = req.params.courseId;
  if (courses[courseId]) {
    res.json(courses[courseId].documents);
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// Serve static files (HTML, CSS, JS, images) including the uploads folder
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
