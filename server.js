require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key"; // Change this to a strong key
const MONGO_URI = process.env.MONGO_URI; // Ensure .env contains the correct MongoDB URI

app.use(cors());
app.use(bodyParser.json());

// Serve static files from page directories
app.use(express.static(path.join(__dirname, 'Home_Page')));
app.use('/forum', express.static(path.join(__dirname, 'Forum_Page')));
app.use('/login', express.static(path.join(__dirname, 'Login_Page')));
app.use('/materials', express.static(path.join(__dirname, 'Material_Page')));
app.use('/comments', express.static(path.join(__dirname, 'Comments_page')));

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
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "❌ Invalid username or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "❌ Invalid username or password" });

        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: "✅ Login successful!", token });
    } catch (error) {
        res.status(500).json({ message: "❌ Server error during login" });
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
    res.sendFile(path.join(__dirname, 'Home_Page', 'index.html'));
});

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
    // Extract the first part of the path
    const firstPathSegment = req.path.split('/')[1];
    
    if (firstPathSegment === 'forum') {
        res.sendFile(path.join(__dirname, 'Forum_Page', 'index.html'));
    } else if (firstPathSegment === 'login') {
        res.sendFile(path.join(__dirname, 'Login_Page', 'index.html'));
    } else if (firstPathSegment === 'materials') {
        res.sendFile(path.join(__dirname, 'Material_Page', 'index.html'));
    } else if (firstPathSegment === 'comments') {
        res.sendFile(path.join(__dirname, 'Comments_page', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'Home_Page', 'index.html'));
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
