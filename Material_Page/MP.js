const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); 

// Connect to MongoDB (Update with your connection string)

// Debugging: Log when trying to connect
console.log("🟡 Attempting to connect to MongoDB...");


// Debugging: Log when trying to connect
console.log("🟡 Attempting to connect to MongoDB...");

mongoose.connect('mongodb://localhost:27017/coursesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // Increase timeout to 10 seconds
  connectTimeoutMS: 10000
}).then(() => {
  console.log(" Successfully connected to MongoDB!");
}).catch(err => {
  console.error(" Mongoose Connection Error:", err);
  process.exit(1); // Stop server if MongoDB fails
});

// Ensure queries only run after connection is established
mongoose.connection.on('connected', async () => {
  console.log(" Mongoose is now connected. Running queries...");
  await initializeCourses(); // Ensures courses exist
});



// Define Schema for Courses and Documents
const documentSchema = new mongoose.Schema({
  title: String,
  image: String, // Store file path
  uploadedAt: { type: Date, default: Date.now }
});

const courseSchema = new mongoose.Schema({
  name: String,
  documents: [documentSchema] // Array of documents
});

// Create a Course model
const Course = mongoose.model('Course', courseSchema);

// Setup storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Create default courses if they don't exist
async function initializeCourses() {
  if (mongoose.connection.readyState !== 1) {
    console.log("⏳ Waiting for MongoDB to connect before querying...");
    return;
  }

  const defaultCourses = ["Phys 200", "Math 200", "Chem 200", "Engl 200", "Cmps 200"];

  for (const courseName of defaultCourses) {
    const existingCourse = await Course.findOne({ name: courseName });

    if (!existingCourse) {
      await new Course({ name: courseName, documents: [] }).save();
      console.log(`✅ Created course: ${courseName}`);
    } else {
      console.log(`⚡ Course already exists: ${courseName}`);
    }
  }
}
initializeCourses();

// Upload file and store in MongoDB
app.post('/upload', upload.single('file'), async (req, res) => {
  const { courseId } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const course = await Course.findOne({ name: courseId });
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const newDoc = {
    title: file.originalname,
    image: `/uploads/${file.filename}`
  };

  course.documents.push(newDoc);
  await course.save();

  res.json({ message: "File uploaded successfully", document: newDoc });
});

// Fetch documents for a specific course
app.get("/documents/:courseId", async (req, res) => {
  const decodedCourseId = decodeURIComponent(req.params.courseId).trim();

  console.log(`🔍 Searching for course: ${decodedCourseId}`);

  // Find course with case-insensitive search
  const course = await Course.findOne({ 
      name: { $regex: `^${decodedCourseId}$`, $options: "i" } 
  });

  if (!course) {
      console.log(`❌ Course not found: '${decodedCourseId}'`);
      return res.status(404).json({ message: "Course not found" });
  }

  console.log(`✅ Found course: '${course.name}', returning documents...`);
  res.json(course.documents);
});




// Serve static files including uploaded documents
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// API to search for courses
app.get('/courses', async (req, res) => {
  const searchQuery = req.query.search;

  try {
      let courses;
      if (searchQuery) {
          courses = await Course.find({ name: { $regex: searchQuery, $options: 'i' } });
      } else {
          courses = await Course.find({});
      }

      res.json(courses);
  } catch (err) {
      console.error(" Error fetching courses:", err);
      res.status(500).json({ error: 'Internal error' });
  }
});

