// ═══════════════════════════════════════
// SABROSO CLOUD KITCHEN — Express Server
// ═══════════════════════════════════════

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

// ── MIDDLEWARE ──
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..')));

// ── API ROUTES ──
app.use('/api/users', require('./routes/users'));
app.use('/api/dishes', require('./routes/dishes'));
app.use('/api/orders', require('./routes/orders'));

// ── ROOT ──
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        server: 'Sabroso Cloud Kitchen API',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 5000;

// ── START SERVER FIRST (so localhost is reachable) ──
app.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════╗');
    console.log('  ║   🔥 SABROSO CLOUD KITCHEN SERVER   ║');
    console.log(`  ║   🌐 Server: http://localhost:${PORT}   ║`);
    console.log('  ╚══════════════════════════════════════╝');
    console.log('');
});

// ── THEN CONNECT TO MONGODB ──
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sabroso';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('  ✅ MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('  ❌ MongoDB Connection Error:', err.message);
        console.log('  💡 The site is live, but some features may not work without a database.');
    });
