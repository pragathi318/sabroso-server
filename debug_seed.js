const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Dish = require('./models/Dish');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI;

const seedUsers = [
    { name: 'Admin User', email: 'admin@sabroso.com', password: 'admin123', role: 'admin', phone: '+91 98765 43210', status: 'active' }
];

async function test() {
    try {
        console.log('Connecting to:', MONGO_URI);
        await mongoose.connect(MONGO_URI);

        console.log('Connected');
        await User.deleteMany({});
        console.log('Cleared Users');
        const u = await User.create(seedUsers[0]);
        console.log('User created:', u.email);
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}
test();
