require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key";
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folders
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/Home_Page", express.static(path.join(__dirname, "Home_Page")));
app.use("/Login_Page", express.static(path.join(__dirname, "Login_Page")));

// ✅ MongoDB Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});

const User = mongoose.model("User", userSchema);

// ✅ Register Endpoint
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.json({ message: "✅ Registration successful!" });
  } catch (err) {
    res.status(400).json({ message: "❌ User already exists!" });
  }
});

// ✅ Login Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "❌ Invalid username or password" });
    }

    const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ message: "✅ Login successful!", token });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error during login" });
  }
});

// ✅ Course Schema
const courseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: String,
  previouses: [{ filename: String, path: String }],
  materials: [{ filename: String, path: String }]
});

const Course = mongoose.model("Course", courseSchema);

// ✅ API: Create Course
app.post("/api/courses", async (req, res) => {
  try {
    const { code, title } = req.body;
    if (!code) return res.status(400).json({ error: "Course code is required" });

    const course = new Course({ code, title });
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Course already exists" });
    } else {
      res.status(500).json({ error: "Server error" });
    }
  }
});

// ✅ API: Get Courses
app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// ✅ Materials API (GET + POST)
app.use("/api/materials", require("./Routes/materials"));
const courseRoutes = require("./Routes/courses");
app.use("/api/courses", courseRoutes);


// Forum Route
const forumRoutes = require("./Routes/forum");
app.use("/api/forum", forumRoutes);

// Reviews Route
const reviewRoutes = require('./Routes/reviews');
app.use('/api/reviews', reviewRoutes);


// ✅ Forum Schema
const QuestionSchema = new mongoose.Schema({
  username: { type: String, required: true },
  category: { type: String, required: true },
  questionText: { type: String, required: true },
  likes: { type: Number, default: 0 },
  replies: [
    { username: String, replyText: String, likes: { type: Number, default: 0 } }
  ]
}, { collection: "questions", timestamps: true });

const Question = mongoose.model("Question", QuestionSchema);

// ✅ Forum Endpoints
app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/questions", async (req, res) => {
  const { username, category, questionText } = req.body;
  if (!username || !category || !questionText) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const newQuestion = new Question({ username, category, questionText });
    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/questions/:id/like", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Not found" });

    question.likes++;
    await question.save();
    res.json({ likes: question.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/questions/:id/reply", async (req, res) => {
  const { username, replyText } = req.body;
  if (!username || !replyText) {
    return res.status(400).json({ error: "Both fields are required" });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Not found" });

    const reply = { username, replyText };
    question.replies.push(reply);
    await question.save();
    res.status(201).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Root: redirect to login
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Login_Page", "login.html"));
});

// ✅ Catch-all fallback route
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "Home_Page", "home.html"));
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
