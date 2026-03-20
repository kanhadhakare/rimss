const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { protect, adminOnly } = require('../middleware/auth');
const logger = require('../config/logger');

// POST /api/orders — place order
router.post('/', protect, async (req, res) => {
    try {
        const { shippingAddress, stripePaymentIntentId } = req.body;
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

        if (!cart || cart.items.length === 0)
            return res.status(400).json({ message: 'Cart is empty' });

        const items = cart.items.map((i) => ({
            product: i.product._id,
            name: i.product.name,
            price: i.product.salePrice,
            quantity: i.quantity,
            size: i.size,
            color: i.color,
        }));

        const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            totalAmount: +totalAmount.toFixed(2),
            stripePaymentIntentId: stripePaymentIntentId || '',
            status: stripePaymentIntentId ? 'paid' : 'pending',
            paidAt: stripePaymentIntentId ? new Date() : undefined,
        });

        // Clear cart after order placement
        await Cart.findOneAndDelete({ user: req.user._id });
        logger.info(`Order placed: ${order._id} by user ${req.user._id}`);
        res.status(201).json(order);
    } catch (err) {
        logger.error(`Place order error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/orders/me — user's own orders
router.get('/me', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        logger.error(`Get my orders error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/orders — all orders (admin)
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        logger.error(`Get all orders error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/orders/:id/status — update order status (admin)
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        if (status === 'paid' && !order.paidAt) order.paidAt = new Date();
        await order.save();

        logger.info(`Order ${order._id} status updated to ${status}`);
        res.json(order);
    } catch (err) {
        logger.error(`Update order status error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
