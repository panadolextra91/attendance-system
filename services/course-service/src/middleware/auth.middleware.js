const jwt = require('jsonwebtoken');

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token from request headers
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user is a teacher or admin
 */
const isTeacherOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { role } = req.user;
  
  if (role !== 'TEACHER' && role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Requires teacher or admin role' });
  }
  
  next();
};

/**
 * Check if user is the owner of a course or an admin
 */
const isCourseOwnerOrAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const userId = req.user.sub || req.user.id;
  const { role } = req.user;
  const courseId = req.params.id || req.body.courseId;
  
  // Admins can access any course
  if (role === 'ADMIN') {
    return next();
  }
  
  // For teachers, check if they own the course
  if (role === 'TEACHER') {
    try {
      const courseService = require('../services/course.service');
      const course = await courseService.getCourseById(courseId);
      
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      if (course.teacherId === userId) {
        return next();
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
  
  return res.status(403).json({ error: 'Forbidden: You do not have access to this course' });
};

module.exports = {
  verifyToken,
  isTeacherOrAdmin,
  isCourseOwnerOrAdmin,
}; 