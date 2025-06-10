const express = require('express');
const courseController = require('../controllers/course.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// GET all courses
router.get('/', courseController.getAllCourses);

// GET course by ID
router.get('/:id', courseController.getCourseById);

// POST create new course (requires teacher or admin role)
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  courseController.createCourse
);

// PUT update course (requires teacher who owns the course or admin)
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  courseController.updateCourse
);

// DELETE course (requires teacher who owns the course or admin)
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  courseController.deleteCourse
);

module.exports = router; 