const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');

// Health check endpoint at root level
router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router; 