const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Dish = require('../models/Dish');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ── PLACE ORDER ──
// POST /api/orders
router.post('/', async (req, res) => {
    try {
        const {
            customerName, customerEmail, customerPhone,
            items, subtotal, deliveryFee, tax, total,
            deliveryAddress, paymentMethod, customer
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const order = await Order.create({
            customer,
            customerName,
            customerEmail,
            customerPhone,
            items,
            subtotal,
            deliveryFee,
            tax,
            total,
            deliveryAddress,
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'Unpaid' : 'Paid',
            orderStatus: 'Placed'
        });

        // Update dish order counts
        for (const item of items) {
            if (item.dish) {
                await Dish.findByIdAndUpdate(item.dish, {
                    $inc: { totalOrders: item.quantity }
                });
            }
        }

        // Update user stats if logged in
        if (customer) {
            await User.findByIdAndUpdate(customer, {
                $inc: { totalOrders: 1, totalSpent: total }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET MY ORDERS ──
// GET /api/orders/my
router.get('/my', protect, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .sort({ createdAt: -1 })
            .populate('items.dish', 'name emoji image');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET SINGLE ORDER ──
// GET /api/orders/:id
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('customer', 'name email phone')
            .populate('items.dish', 'name emoji image');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET ORDER BY ORDER ID ──
// GET /api/orders/track/:orderId
router.get('/track/:orderId', async (req, res) => {
    try {
        const order = await Order.findOne({ orderId: req.params.orderId });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── GET ALL ORDERS (Admin) ──
// GET /api/orders
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const { status, payment, sort } = req.query;
        let query = {};

        if (status && status !== 'all') query.orderStatus = status;
        if (payment && payment !== 'all') query.paymentStatus = payment;

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        if (sort === 'amount-high') sortOption = { total: -1 };

        const orders = await Order.find(query)
            .sort(sortOption)
            .populate('customer', 'name email');
        res.json({ orders, count: orders.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── UPDATE ORDER STATUS (Admin) ──
// PUT /api/orders/:id/status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        const updated = await order.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── DELETE ORDER (Admin) ──
// DELETE /api/orders/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ── ORDER STATS (Admin Dashboard) ──
// GET /api/orders/admin/stats
router.get('/admin/stats', protect, adminOnly, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const delivered = await Order.countDocuments({ orderStatus: 'Delivered' });
        const preparing = await Order.countDocuments({ orderStatus: 'Preparing' });
        const inTransit = await Order.countDocuments({ orderStatus: 'Out for Delivery' });
        const cancelled = await Order.countDocuments({ orderStatus: 'Cancelled' });

        const revenueResult = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Monthly revenue for charts
        const monthlyRevenue = await Order.aggregate([
            { $match: { orderStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Payment method breakdown
        const paymentBreakdown = await Order.aggregate([
            { $group: { _id: '$paymentMethod', count: { $sum: 1 } } }
        ]);

        res.json({
            totalOrders,
            delivered,
            preparing,
            inTransit,
            cancelled,
            totalRevenue,
            monthlyRevenue,
            paymentBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
