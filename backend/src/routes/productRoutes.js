const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const logger = require('../config/logger');

// GET /api/products — with search & filters
router.get('/', async (req, res) => {
    try {
        const { search, category, gender, minPrice, maxPrice, color, discount, featured, limit = 20, page = 1 } = req.query;
        const query = {};

        if (search) query.name = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (gender) query.gender = gender;
        if (color) query.colors = { $in: [color] };
        if (discount === 'true') query.discountPct = { $gt: 0 };
        if (featured === 'true') query.featured = true;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            Product.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
            Product.countDocuments(query),
        ]);

        res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
    } catch (err) {
        logger.error(`Get products error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        logger.error(`Get product error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/products (admin)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (err) {
        logger.error(`Create product error: ${err.message}`);
        res.status(400).json({ message: err.message });
    }
});

// PUT /api/products/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        logger.error(`Update product error: ${err.message}`);
        res.status(400).json({ message: err.message });
    }
});

// DELETE /api/products/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed' });
    } catch (err) {
        logger.error(`Delete product error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
