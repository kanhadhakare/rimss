const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const logger = require('../config/logger');

// GET /api/cart
router.get('/', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
        if (!cart) return res.json({ items: [], total: 0 });
        res.json(cart);
    } catch (err) {
        logger.error(`Get cart error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/cart — add / update item
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity = 1, size = '', color = '' } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) cart = new Cart({ user: req.user._id, items: [] });

        const existingIdx = cart.items.findIndex(
            (i) => i.product.toString() === productId && i.size === size && i.color === color
        );

        if (existingIdx >= 0) {
            cart.items[existingIdx].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity, size, color });
        }

        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        logger.error(`Add to cart error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/cart/:itemId — update quantity
router.put('/:itemId', protect, async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = cart.items.id(req.params.itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        if (quantity <= 0) {
            item.deleteOne();
        } else {
            item.quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        logger.error(`Update cart error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/cart/:itemId — remove item
router.delete('/:itemId', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter((i) => i._id.toString() !== req.params.itemId);
        await cart.save();
        await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        logger.error(`Remove cart item error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/cart — clear cart
router.delete('/', protect, async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user._id });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        logger.error(`Clear cart error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
