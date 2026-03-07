const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ── REGISTER ──
// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Create user
        const user = await User.create({ name, email, password, phone });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── LOGIN ──
// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET MY PROFILE ──
// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── UPDATE PROFILE ──
// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.name = req.body.name || user.name;
        user.phone = req.body.phone || user.phone;
        if (req.body.address) user.address = req.body.address;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET ALL USERS (Admin) ──
// GET /api/users
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json({ users, count: users.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET USER STATS (Admin) ──
// GET /api/users/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
    try {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ status: 'active' });
        const inactive = await User.countDocuments({ status: 'inactive' });
        const admins = await User.countDocuments({ role: 'admin' });
        const premium = await User.countDocuments({ role: 'premium' });

        res.json({ total, active, inactive, admins, premium });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
