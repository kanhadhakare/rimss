const express = require('express');
const router = express.Router();
const Lookbook = require('../models/Lookbook');
const logger = require('../config/logger');

// GET /api/lookbooks — list all lookbooks
router.get('/', async (_req, res) => {
    try {
        const lookbooks = await Lookbook.find()
            .sort({ createdAt: -1 })
            .select('-products');
        res.json(lookbooks);
    } catch (err) {
        logger.error(`Get lookbooks error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/lookbooks/:id — get one lookbook with populated products
router.get('/:id', async (req, res) => {
    try {
        const lookbook = await Lookbook.findById(req.params.id)
            .populate('products');
        if (!lookbook) return res.status(404).json({ message: 'Lookbook not found' });
        res.json(lookbook);
    } catch (err) {
        logger.error(`Get lookbook error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
