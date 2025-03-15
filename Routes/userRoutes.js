const express = require('express');
const router = express.Router();
const User = require('../Models/User');  // Ensure this path correctly points to your User model

// GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error accessing the users data.", error: error });
    }
});

// POST a new user
router.post('/users', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: "Error creating a user.", error: error });
    }
});

module.exports = router;
