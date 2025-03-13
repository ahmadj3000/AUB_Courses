const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Load answers from file
const loadAnswers = () => {
    try {
        return JSON.parse(fs.readFileSync("data.json", "utf8"));
    } catch (err) {
        return [];
    }
};

// Save answers to file
const saveAnswers = (answers) => {
    fs.writeFileSync("data.json", JSON.stringify(answers, null, 2));
};

// ✅ Get all answers
app.get("/answers", (req, res) => {
    res.json(loadAnswers());
});

// ✅ Post a new answer (Now Includes Category)
app.post("/answers", (req, res) => {
    const { username, category, answerText } = req.body;

    if (!username || !category || !answerText) {
        return res.status(400).json({ error: "Username, category, and answer text are required" });
    }

    const answers = loadAnswers();
    const newAnswer = {
        id: answers.length + 1,
        username,
        category, // ✅ Save category
        answerText,
        likes: 0,
        replies: []
    };

    answers.push(newAnswer);
    saveAnswers(answers);

    res.json(newAnswer);
});

// ✅ Increase likes for an answer
app.post("/answers/:id/like", (req, res) => {
    const answers = loadAnswers();
    const answer = answers.find(a => a.id === parseInt(req.params.id));

    if (!answer) return res.status(404).json({ error: "Answer not found" });

    answer.likes += 1;
    saveAnswers(answers);

    res.json(answer);
});

// ✅ Post a reply to an answer
app.post("/answers/:id/reply", (req, res) => {
    const { username, replyText } = req.body;

    if (!username || !replyText) {
        return res.status(400).json({ error: "Both username and reply text are required" });
    }

    const answers = loadAnswers();
    const answer = answers.find(a => a.id === parseInt(req.params.id));

    if (!answer) return res.status(404).json({ error: "Answer not found" });

    const newReply = { username, replyText };
    answer.replies.push(newReply);
    saveAnswers(answers);

    res.json(newReply);
});

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
