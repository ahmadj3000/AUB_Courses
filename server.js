require('dotenv').config({ path: '.env' });
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
const JWT_SECRET = process.env.JWT_SECRET;

const MONGO_URI = process.env.MONGO_URI;

const Sib = require('sib-api-v3-sdk');


const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const brevoEmail = new Sib.TransactionalEmailsApi();



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
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  major: { type: String }  // ✅ New field added
});

const User = mongoose.model("User", userSchema);

// ✅ Register Endpoint
// ✅ Register Endpoint
app.post("/register", async (req, res) => {
  const { username, email, password, major } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

// Log to verify JWT_SECRET is defined
console.log("JWT_SECRET:", JWT_SECRET);

const verificationToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: "1d" });

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      major,//added major
    });

    console.log("👉 Saving user:", newUser);
    await newUser.save();
    console.log("✅ User saved successfully");

    const verificationLink = process.env.NODE_ENV === "production"
      ? `https://aub-courses-qhnx.onrender.com/verify?token=${verificationToken}`
      : `http://localhost:3000/verify?token=${verificationToken}`;

    // ✅ TRY TO SEND EMAIL
    try {
      await brevoEmail.sendTransacEmail({
        sender: {
          name: "AUB Courses",
          email:  "faris-refai@Hotmail.com" // ✅ Use verified sender
        },
        to: [{ email, name: username }],
        subject: "Please verify your email address",
        htmlContent: `
          <h2>Welcome to AUB Courses!</h2>
          <p>Hello ${username},</p>
          <p>Click the link below to verify your email:</p>
          <a href="${verificationLink}">Verify Email</a>
        `
      });

      console.log("📧 Verification email sent!");
      res.json({ message: "✅ Registered! Please check your email to verify your account." });

    } catch (emailErr) {
      console.error("❌ Failed to send email. Reason:", emailErr.response?.body || emailErr.message || emailErr);

      res.status(200).json({ message: "⚠️ Registered, but failed to send verification email." });
    }

  } catch (err) {
    console.error("❌ Registration failed:", err);
    res.status(400).json({ message: "❌ Registration failed!" });
  }
});



// ✅ Verify Email Route
app.get("/verify", async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "❌ No token provided!" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);  // Verify the token

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "❌ User not found!" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "❌ This email is already verified." });
    }

    user.isVerified = true;
    user.verificationToken = null;  // Optionally, remove the token after verification
    await user.save();

    res.json({ message: "✅ Email successfully verified!" });
  } catch (err) {
    res.status(400).json({ message: "❌ Invalid or expired token!" });
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
    
    if (!user.isVerified) {
      return res.status(403).json({ message: "❌ Please verify your email before logging in." });
    }
    

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
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
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "Home_Page", "home.html"));
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
