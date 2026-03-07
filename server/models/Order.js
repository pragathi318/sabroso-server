const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    customerName: {
        type: String,
        required: true
    },
    customerEmail: {
        type: String,
        default: ''
    },
    customerPhone: {
        type: String,
        default: ''
    },
    items: [orderItemSchema],
    subtotal: {
        type: Number,
        required: true
    },
    deliveryFee: {
        type: Number,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    deliveryAddress: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        pincode: { type: String, default: '' },
        instructions: { type: String, default: '' }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'upi', 'card'],
        default: 'cod'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Refunded'],
        default: 'Unpaid'
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    deliveryPartner: {
        type: String,
        default: ''
    },
    estimatedDelivery: {
        type: String,
        default: '25-35 min'
    }
}, {
    timestamps: true
});

// Auto-generate orderId before saving
orderSchema.pre('save', async function () {
    if (!this.orderId) {
        this.orderId = 'SAB-' + Math.floor(100000 + Math.random() * 900000);
    }
});

module.exports = mongoose.model('Order', orderSchema);
