const express = require('express');
const Dish = require('../models/Dish');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ── GET ALL DISHES (Public) ──
// GET /api/dishes
router.get('/', async (req, res) => {
    try {
        const { cuisine, featured, available, search, sort } = req.query;
        let query = {};

        if (cuisine && cuisine !== 'all') query.cuisine = cuisine;
        if (featured === 'true') query.isFeatured = true;
        if (available === 'true') query.isAvailable = true;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { cuisine: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price-low') sortOption = { price: 1 };
        if (sort === 'price-high') sortOption = { price: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'popular') sortOption = { totalOrders: -1 };

        const dishes = await Dish.find(query).sort(sortOption);
        res.json({ dishes, count: dishes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET SINGLE DISH (Public) ──
// GET /api/dishes/:id
router.get('/:id', async (req, res) => {
    try {
        const dish = await Dish.findById(req.params.id);
        if (!dish) return res.status(404).json({ message: 'Dish not found' });
        res.json(dish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── CREATE DISH (Admin) ──
// POST /api/dishes
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const dish = await Dish.create(req.body);
        res.status(201).json(dish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── UPDATE DISH (Admin) ──
// PUT /api/dishes/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!dish) return res.status(404).json({ message: 'Dish not found' });
        res.json(dish);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── DELETE DISH (Admin) ──
// DELETE /api/dishes/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const dish = await Dish.findByIdAndDelete(req.params.id);
        if (!dish) return res.status(404).json({ message: 'Dish not found' });
        res.json({ message: 'Dish removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET DISH STATS (Admin) ──
// GET /api/dishes/admin/stats
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
    try {
        const total = await Dish.countDocuments();
        const available = await Dish.countDocuments({ isAvailable: true });
        const topDishes = await Dish.find().sort({ totalOrders: -1 }).limit(5);
        const cuisineCounts = await Dish.aggregate([
            { $group: { _id: '$cuisine', count: { $sum: 1 }, orders: { $sum: '$totalOrders' } } },
            { $sort: { orders: -1 } }
        ]);

        res.json({ total, available, topDishes, cuisineCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
