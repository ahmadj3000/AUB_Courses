const express = require("express");
const router = express.Router();
const Post = require("../Models/Post");

// Create a new forum post
router.post("/", async (req, res) => {
  const { title, category, content, courseId } = req.body;

  if (!title || !category || !content || !courseId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const post = new Post({ title, category, content, courseId });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all posts for a course
router.get("/:courseId", async (req, res) => {
  try {
    const posts = await Post.find({ courseId: req.params.courseId }).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch posts" });
  }
});

router.post('/:postId/answer', async (req, res) => {
  const { content, author = 'Anonymous' } = req.body;

  if (!content) return res.status(400).json({ error: 'Answer content required' });

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const newAnswer = { content, author };
    
    post.answers.push(newAnswer);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    console.error("❌ Error saving answer:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all answers for a post
router.get('/:postId/answers', async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    res.json(post.answers);
  } catch (err) {
    console.error("Error fetching answers:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH: Upvote or downvote a post
router.patch('/:postId/vote', async (req, res) => {
  const { direction } = req.body;

  if (!['up', 'down'].includes(direction)) {
    return res.status(400).json({ error: 'Invalid vote direction' });
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.votes += direction === 'up' ? 1 : -1;
    await post.save();

    res.status(200).json({ votes: post.votes });
  } catch (err) {
    console.error('Vote error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;