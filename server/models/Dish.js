const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Dish name is required'],
        trim: true
    },
    description: {
        type: String,
        default: 'A delicious dish from our global kitchen.'
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    cuisine: {
        type: String,
        required: true,
        enum: ['European', 'Japanese', 'Korean', 'Mexican', 'African']
    },
    country: {
        type: String,
        default: ''
    },
    emoji: {
        type: String,
        default: '🍽️'
    },
    image: {
        type: String,
        default: ''
    },
    prepTime: {
        type: Number,
        default: 25
    },
    spiceLevel: {
        type: String,
        enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
        default: 'Mild'
    },
    rating: {
        type: Number,
        default: 4.5,
        min: 0,
        max: 5
    },
    totalOrders: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Dish', dishSchema);
