const express = require('express');
const courseRoutes = require('./course.routes');
const lectureRoutes = require('./lecture.routes');

const router = express.Router();

// Define routes
router.use('/courses', courseRoutes);
router.use('/lectures', lectureRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'course-service' });
});

module.exports = router; 