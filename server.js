require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require('path');
const multer = require("multer");

// Setup file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });


const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a strong key
const MONGO_URI = process.env.MONGO_URI; // Ensure .env contains the correct MongoDB URI

app.use(cors());
app.use(bodyParser.json());

// Serve static files from page directories
app.use('/Home_Page', express.static(path.join(__dirname, 'Home_Page')));
app.use('/Forum_Page', express.static(path.join(__dirname, 'Forum_Page')));
app.use('/Login_Page', express.static(path.join(__dirname, 'Login_Page')));
app.use('/Material_Page', express.static(path.join(__dirname, 'Material_Page')));
app.use('/Comments_Page', express.static(path.join(__dirname, 'Comments_page')));

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));


// ✅ Define User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema); // Create User model

// ✅ Register Endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();
        res.json({ message: "✅ Registration successful!" });
    } catch (error) {
        res.status(400).json({ message: "❌ User already exists!" });
    }
});

// ✅ Login Endpoint
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
          });
        if (!user) return res.status(400).json({ message: "❌ Invalid username or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "❌ Invalid username or password" });

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "✅ Login successful!", token });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error during login" });
    }
});

//Course Schema
const courseSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    title: { type: String },
    previouses: [{ filename: String, path: String }],
    materials: [{ filename: String, path: String }]
  });
  
  const Course = mongoose.model("Course", courseSchema);

app.use(cors());
app.use(express.json());
const materialRoutes = require("./Routes/materialRoutes");
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded filess
app.use("/api/materials", materialRoutes);
app.use("/api/materials", require("./Routes/materialRoutes"));


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
        console.error(err);
        res.status(500).json({ error: "Server error" });
      }
    }
  });

  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await Course.find();
      res.json(courses);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });
  

// ✅ Define Schema & Model for Questions (Forum)
const QuestionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    category: { type: String, required: true },
    questionText: { type: String, required: true },
    likes: { type: Number, default: 0 },
    replies: [{ username: String, replyText: String, likes: { type: Number, default: 0 } }]
}, { collection: "questions", timestamps: true });

const Question = mongoose.model("Question", QuestionSchema);

// ✅ API: Get All Questions
app.get("/questions", async (req, res) => {
    try {
        const questions = await Question.find().sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API: Post a New Question
app.post("/questions", async (req, res) => {
    try {
        console.log("🔍 Received Question Data:", req.body);  // ✅ Debugging Log

        const { username, category, questionText } = req.body;
        if (!username || !category || !questionText) {
            console.log("❌ Missing Fields in Request"); // ✅ Debugging Log
            return res.status(400).json({ error: "All fields are required" });
        }

        const newQuestion = new Question({ username, category, questionText });
        await newQuestion.save();

        console.log("✅ Question saved to MongoDB:", newQuestion);  // ✅ Debugging Log
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error("❌ Error saving question to MongoDB:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ API: Increase Likes for a Question
app.post("/questions/:id/like", async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ error: "Question not found" });

        question.likes += 1;
        await question.save();

        res.json({ likes: question.likes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ API: Post a Reply to a Question
app.post("/questions/:id/reply", async (req, res) => {
    try {
        const { username, replyText } = req.body;
        if (!username || !replyText) {
            return res.status(400).json({ error: "Both username and reply text are required" });
        }

        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({ error: "Question not found" });

        const newReply = { username, replyText, likes: 0 };
        question.replies.push(newReply);
        await question.save();

        res.status(201).json(newReply);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Define Homepage Route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'Home_Page', 'home.html'));
  });

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
    // Extract the first part of the path
    const firstPathSegment = req.path.split('/')[1];
    
    if (firstPathSegment === 'forum') {
        res.sendFile(path.join(__dirname, 'Forum_Page', 'index.html'));
    } else if (firstPathSegment === 'login') {
        res.sendFile(path.join(__dirname, 'Login_Page', 'login.html'));
    } else if (firstPathSegment === 'materials') {
        res.sendFile(path.join(__dirname, 'Material_Page', 'index.html'));
    } else if (firstPathSegment === 'comments') {
        res.sendFile(path.join(__dirname, 'Comments_page', 'comments.html'));
    } else {
        res.sendFile(path.join(__dirname, 'Home_Page', 'home.html'));
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
