const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const logger = require('../config/logger');

// POST /api/payment/create-intent
router.post('/create-intent', protect, async (req, res) => {
    try {
        const { amount } = req.body; // amount in cents

        // Guard: Stripe key must be real (not placeholder) to use SDK
        if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
            // Return a mock client secret for demo/development purposes
            logger.warn('Stripe key not configured — returning mock payment intent');
            return res.json({
                clientSecret: 'pi_mock_secret_' + Date.now(),
                mock: true,
            });
        }

        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount),
            currency: 'gbp',
            automatic_payment_methods: { enabled: true },
        });

        res.json({ clientSecret: paymentIntent.client_secret, mock: false });
    } catch (err) {
        logger.error(`Payment intent error: ${err.message}`);
        res.status(500).json({ message: 'Payment error' });
    }
});

module.exports = router;
