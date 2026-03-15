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

// ── CONNECT TO MONGODB & START SERVER ──
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sabroso';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('');
        console.log('  ╔══════════════════════════════════════╗');
        console.log('  ║   🔥 SABROSO CLOUD KITCHEN SERVER   ║');
        console.log('  ╠══════════════════════════════════════╣');
        console.log('  ║                                      ║');
        console.log(`  ║   ✅ MongoDB Connected               ║`);
        console.log(`  ║   🌐 Server: http://localhost:${PORT}   ║`);
        console.log('  ║                                      ║');
        console.log('  ║   API Endpoints:                     ║');
        console.log('  ║   • /api/users    (Auth & Users)     ║');
        console.log('  ║   • /api/dishes   (Menu)             ║');
        console.log('  ║   • /api/orders   (Orders)           ║');
        console.log('  ║   • /api/health   (Status)           ║');
        console.log('  ║                                      ║');
        console.log('  ╚══════════════════════════════════════╝');
        console.log('');

        app.listen(PORT);
    })
    .catch(err => {
        console.error('');
        console.error('  ❌ MongoDB Connection Failed!');
        console.error('  Error:', err.message);
        console.error('');
        console.error('  💡 Make sure MongoDB is running:');
        console.error('     Option 1: Install MongoDB locally');
        console.error('     Option 2: Use MongoDB Atlas (cloud):');
        console.error('     https://www.mongodb.com/atlas');
        console.error('');
        process.exit(1);
    });
