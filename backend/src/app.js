const express = require('express');
const cors = require('cors');
const logger = require('./config/logger');

const app = express();

// CORS configuration
const allowedOrigins = [
    // Alternative local port
    process.env.CLIENT_URL,       // Environment variable (production Vercel URL)
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null  // Vercel preview URLs
].filter(Boolean);

// Middleware
app.use(cors({ 
    origin: allowedOrigins, 
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/lookbooks', require('./routes/lookbookRoutes'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// robots.txt
app.get('/robots.txt', (_req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nAllow: /\nDisallow: /api/');
});

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

// Global error handler
app.use((err, _req, res, _next) => {
    logger.error(`Unhandled error: ${err.message}`);
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;
