const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    price: Number,
    quantity: { type: Number, required: true },
    size: String,
    color: String,
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        items: [orderItemSchema],
        shippingAddress: {
            fullName: String,
            address: String,
            city: String,
            postalCode: String,
            country: String,
        },
        totalAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
        stripePaymentIntentId: { type: String, default: '' },
        paidAt: Date,
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
