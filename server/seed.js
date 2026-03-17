// ═══════════════════════════════════════
// SABROSO — Database Seed Script
// Run: node seed.js
// ═══════════════════════════════════════

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Dish = require('./models/Dish');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sabroso';

// ── SEED DATA ──
const seedUsers = [
    { name: 'Admin User', email: 'admin@sabroso.com', password: 'admin123', role: 'admin', phone: '+91 98765 43210', status: 'active' },
    { name: 'Aarav Sharma', email: 'aarav@email.com', password: 'user123', role: 'premium', phone: '+91 91234 56789', status: 'active', totalOrders: 42, totalSpent: 584.50 },
    { name: 'Priya Patel', email: 'priya@email.com', password: 'user123', role: 'customer', phone: '+91 92345 67890', status: 'active', totalOrders: 28, totalSpent: 392.80 },
    { name: 'Rohan Mehra', email: 'rohan@email.com', password: 'user123', role: 'customer', phone: '+91 93456 78901', status: 'active', totalOrders: 15, totalSpent: 198.70 },
    { name: 'Sneha Reddy', email: 'sneha@email.com', password: 'user123', role: 'premium', phone: '+91 94567 89012', status: 'active', totalOrders: 56, totalSpent: 748.20 },
    { name: 'Vikram Singh', email: 'vikram@email.com', password: 'user123', role: 'customer', phone: '+91 95678 90123', status: 'inactive', totalOrders: 8, totalSpent: 112.40 },
    { name: 'Ananya Gupta', email: 'ananya@email.com', password: 'user123', role: 'customer', phone: '+91 96789 01234', status: 'active', totalOrders: 22, totalSpent: 310.50 },
    { name: 'Karthik Nair', email: 'karthik@email.com', password: 'user123', role: 'premium', phone: '+91 97890 12345', status: 'active', totalOrders: 38, totalSpent: 521.60 },
    { name: 'Divya Iyer', email: 'divya@email.com', password: 'user123', role: 'customer', phone: '+91 98901 23456', status: 'active', totalOrders: 19, totalSpent: 267.30 },
    { name: 'Meera Joshi', email: 'meera@email.com', password: 'user123', role: 'premium', phone: '+91 99012 34567', status: 'active', totalOrders: 47, totalSpent: 643.90 },
    { name: 'Pragathi G', email: 'garipallypragathi@gmail.com', password: 'user123', role: 'customer', phone: '+91 99999 88888', status: 'active' }
];

const seedDishes = [
    { name: 'Spaghetti Bolognese', description: 'Classic Italian pasta with rich meat sauce, parmesan, and fresh basil.', price: 599, cuisine: 'European', country: '🇮🇹 Italy', emoji: '🍝', image: 'https://images.unsplash.com/photo-1622973536968-3ead9e780960?w=500', prepTime: 22, spiceLevel: 'Mild', rating: 4.9, totalOrders: 342, isFeatured: true, tags: ['pasta', 'italian', 'classic'] },
    { name: 'Sushi Platter', description: 'Assorted nigiri and maki rolls with wasabi, pickled ginger, and soy sauce.', price: 999, cuisine: 'Japanese', country: '🇯🇵 Japan', emoji: '🍣', image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500', prepTime: 30, spiceLevel: 'Mild', rating: 4.8, totalOrders: 289, isFeatured: true, tags: ['sushi', 'japanese', 'seafood'] },
    { name: 'Bibimbap Bowl', description: 'Korean rice bowl with seasoned vegetables, egg, and spicy gochujang sauce.', price: 749, cuisine: 'Korean', country: '🇰🇷 Korea', emoji: '🍚', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800', prepTime: 18, spiceLevel: 'Medium', rating: 4.7, totalOrders: 245, isFeatured: true, tags: ['korean', 'rice', 'healthy'] },
    { name: 'Chicken Tacos', description: 'Grilled chicken tacos with fresh salsa, guacamole, and lime crema.', price: 549, cuisine: 'Mexican', country: '🇲🇽 Mexico', emoji: '🌮', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500', prepTime: 15, spiceLevel: 'Hot', rating: 4.8, totalOrders: 312, isFeatured: true, tags: ['tacos', 'mexican', 'spicy'] },
    { name: 'Moambe Chicken', description: 'Traditional African chicken stewed in rich palm nut sauce with vegetables.', price: 849, cuisine: 'African', country: '🌍 Africa', emoji: '🍗', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500', prepTime: 28, spiceLevel: 'Medium', rating: 4.6, totalOrders: 178, tags: ['african', 'chicken', 'stew'] },
    { name: 'Tonkotsu Ramen', description: 'Rich pork bone broth ramen with chashu, soft egg, and bamboo shoots.', price: 899, cuisine: 'Japanese', country: '🇯🇵 Japan', emoji: '🍜', image: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=500', prepTime: 25, spiceLevel: 'Medium', rating: 4.9, totalOrders: 267, isFeatured: true, tags: ['ramen', 'japanese', 'noodles'] },
    { name: 'Mushroom Risotto', description: 'Creamy Arborio rice with wild mushrooms, truffle oil, and parmesan.', price: 799, cuisine: 'European', country: '🇮🇹 Italy', emoji: '🍄', image: 'https://images.unsplash.com/photo-1633337474586-778eb42617a2?w=500', prepTime: 30, spiceLevel: 'Mild', rating: 4.7, totalOrders: 198, tags: ['risotto', 'italian', 'vegetarian'] },
    { name: 'Kimchi Jjigae', description: 'Spicy Korean kimchi stew with tofu, pork, and vegetables.', price: 699, cuisine: 'Korean', country: '🇰🇷 Korea', emoji: '🥘', image: 'https://images.unsplash.com/photo-1580651315530-69c8e0026377?w=500', prepTime: 20, spiceLevel: 'Hot', rating: 4.5, totalOrders: 156, tags: ['korean', 'spicy', 'stew'] },
    { name: 'Churros & Chocolate', description: 'Crispy cinnamon churros with warm Mexican chocolate dipping sauce.', price: 399, cuisine: 'Mexican', country: '🇲🇽 Mexico', emoji: '🍫', image: 'https://images.unsplash.com/photo-1624371414361-e670edf48f8d?w=500', prepTime: 12, spiceLevel: 'Mild', rating: 4.8, totalOrders: 203, tags: ['dessert', 'mexican', 'sweet'] },
    { name: 'Jollof Rice', description: 'West African tomato rice with aromatic spices and grilled chicken.', price: 649, cuisine: 'African', country: '🌍 Africa', emoji: '🍚', image: 'https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500', prepTime: 25, spiceLevel: 'Medium', rating: 4.6, totalOrders: 134, tags: ['african', 'rice', 'chicken'] },
    { name: 'Margherita Pizza', description: 'Classic Neapolitan pizza with San Marzano tomatoes, mozzarella, and basil.', price: 599, cuisine: 'European', country: '🇮🇹 Italy', emoji: '🍕', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500', prepTime: 18, spiceLevel: 'Mild', rating: 4.9, totalOrders: 321, isFeatured: true, tags: ['pizza', 'italian', 'classic'] },
    { name: 'Tempura Udon', description: 'Thick wheat noodles in dashi broth with crispy shrimp and vegetable tempura.', price: 749, cuisine: 'Japanese', country: '🇯🇵 Japan', emoji: '🍤', image: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=500', prepTime: 20, spiceLevel: 'Mild', rating: 4.7, totalOrders: 189, tags: ['udon', 'japanese', 'noodles'] }
];

async function seed() {
    try {
        console.log('\n  🌱 Starting database seed...\n');

        await mongoose.connect(MONGO_URI);
        console.log('  ✅ Connected to MongoDB\n');

        // Clear existing data
        await User.deleteMany({});
        await Dish.deleteMany({});
        await Order.deleteMany({});
        console.log('  🗑️  Cleared existing data\n');

        // Seed Users
        console.log('  - Seeding users...');
        const createdUsers = await User.create(seedUsers);
        console.log(`    ✅ Created ${createdUsers.length} users`);

        console.log('  - Seeding dishes...');
        const createdDishes = await Dish.create(seedDishes);
        console.log(`    ✅ Created ${createdDishes.length} dishes`);

        // Seed some Orders
        const sampleOrders = [
            { customerName: 'Aarav Sharma', customer: createdUsers[1]._id, items: [{ dish: createdDishes[0]._id, name: 'Spaghetti Bolognese', price: 949, quantity: 2 }], subtotal: 1898, tax: 95, total: 1993, orderStatus: 'Delivered', paymentStatus: 'Paid', paymentMethod: 'upi' },
            { customerName: 'Priya Patel', customer: createdUsers[2]._id, items: [{ dish: createdDishes[3]._id, name: 'Chicken Tacos', price: 799, quantity: 3 }], subtotal: 2397, tax: 120, total: 2517, orderStatus: 'Preparing', paymentStatus: 'Paid', paymentMethod: 'card' },
            { customerName: 'Rohan Mehra', customer: createdUsers[3]._id, items: [{ dish: createdDishes[1]._id, name: 'Sushi Platter', price: 1399, quantity: 1 }], subtotal: 1399, tax: 70, total: 1469, orderStatus: 'Out for Delivery', paymentStatus: 'Paid', paymentMethod: 'upi' },
            { customerName: 'Sneha Reddy', customer: createdUsers[4]._id, items: [{ dish: createdDishes[5]._id, name: 'Tonkotsu Ramen', price: 1049, quantity: 1 }], subtotal: 1049, tax: 52, total: 1101, orderStatus: 'Delivered', paymentStatus: 'Paid', paymentMethod: 'cod' },
            { customerName: 'Vikram Singh', customer: createdUsers[5]._id, items: [{ dish: createdDishes[2]._id, name: 'Bibimbap Bowl', price: 1099, quantity: 1 }], subtotal: 1099, tax: 55, total: 1154, orderStatus: 'Delivered', paymentStatus: 'Paid', paymentMethod: 'cod' },
            { customerName: 'Ananya Gupta', customer: createdUsers[6]._id, items: [{ dish: createdDishes[4]._id, name: 'Moambe Chicken', price: 1249, quantity: 1 }], subtotal: 1249, tax: 62, total: 1311, orderStatus: 'Cancelled', paymentStatus: 'Refunded', paymentMethod: 'card' },
            { customerName: 'Karthik Nair', customer: createdUsers[7]._id, items: [{ dish: createdDishes[6]._id, name: 'Mushroom Risotto', price: 1299, quantity: 1 }], subtotal: 1299, tax: 65, total: 1364, orderStatus: 'Delivered', paymentStatus: 'Paid', paymentMethod: 'upi' },
            { customerName: 'Divya Iyer', customer: createdUsers[8]._id, items: [{ dish: createdDishes[7]._id, name: 'Kimchi Jjigae', price: 999, quantity: 1 }], subtotal: 999, tax: 50, total: 1049, orderStatus: 'Preparing', paymentStatus: 'Unpaid', paymentMethod: 'cod' },
        ];

        const createdOrders = await Order.create(sampleOrders);
        console.log(`  📦 Created ${createdOrders.length} orders\n`);

        console.log('  ══════════════════════════════════════');
        console.log('  ✅ Database seeded successfully!');
        console.log('  ══════════════════════════════════════');
        console.log('');
        console.log('  🔐 Admin Login:');
        console.log('     Email: admin@sabroso.com');
        console.log('     Password: admin123');
        console.log('');
        console.log('  👤 Test User Login:');
        console.log('     Email: aarav@email.com');
        console.log('     Password: user123');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('\n  ❌ Seed failed!');
        console.error(error);
        process.exit(1);
    }
}

seed();
