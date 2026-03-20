const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

// GET /api/users/profile - Get user profile
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        logger.error(`Get profile error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/profile - Update user basic info
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, password, avatar } = req.body;
        const user = await User.findById(req.user._id);

        if (name) user.name = name;
        if (avatar) user.avatar = avatar;
        if (password) {
            user.password = password; // pre-save hook handles hashing
        }

        await user.save();
        res.json(user);
    } catch (err) {
        logger.error(`Update profile error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/users/addresses - Add a new address
router.post('/addresses', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const newAddress = req.body;

        // If this is set to home, unset others
        if (newAddress.isHome) {
            user.addresses.forEach(a => a.isHome = false);
        }
        // If it's the first address, make it home by default
        if (user.addresses.length === 0) {
            newAddress.isHome = true;
        }

        user.addresses.push(newAddress);
        await user.save();
        res.status(201).json(user.addresses[user.addresses.length - 1]);
    } catch (err) {
        logger.error(`Add address error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/users/addresses/:id - Update an address
router.put('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.id);

        if (!address) return res.status(404).json({ message: 'Address not found' });

        const updates = req.body;

        if (updates.isHome && !address.isHome) {
            user.addresses.forEach(a => a.isHome = false);
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (key !== '_id') address[key] = updates[key];
        });

        await user.save();
        res.json(address);
    } catch (err) {
        logger.error(`Update address error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/users/addresses/:id - Delete an address
router.delete('/addresses/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const address = user.addresses.id(req.params.id);

        if (!address) return res.status(404).json({ message: 'Address not found' });

        const wasHome = address.isHome;
        address.deleteOne();

        // If we deleted the home address and others remain, make the first one home
        if (wasHome && user.addresses.length > 0) {
            user.addresses[0].isHome = true;
        }

        await user.save();
        res.json({ message: 'Address removed' });
    } catch (err) {
        logger.error(`Delete address error: ${err.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
