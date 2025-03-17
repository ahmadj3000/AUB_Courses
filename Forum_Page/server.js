// ✅ Load Environment Variables
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI; // Ensure .env file contains the correct MongoDB URI

app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Define Schema & Model for Questions
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


// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
