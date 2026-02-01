const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new user (Public for registration, or protected for admin)
router.post('/', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ message: 'User created successfully', user: { id: user._id, username, email, role } });
    } catch (error) {
        res.status(400).json({ message: 'Error creating user', error: error.message });
    }
});

// Get all users (Protected)
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Get a single user (Protected)
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id, '-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user', error: error.message });
    }
});

// Update a user (Protected)
router.put('/:id', auth, async (req, res) => {
    try {
        const { username, email, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { username, email, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        res.status(400).json({ message: 'Error updating user', error: error.message });
    }
});

// Delete a user (Protected)
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
