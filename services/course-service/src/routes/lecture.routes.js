const express = require('express');
const lectureController = require('../controllers/lecture.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// GET all lectures
router.get('/', lectureController.getAllLectures);

// GET lectures by course ID
router.get('/course/:courseId', lectureController.getLecturesByCourse);

// GET lecture by ID
router.get('/:id', lectureController.getLectureById);

// POST create new lecture (requires teacher who owns the course or admin)
router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  lectureController.createLecture
);

// PUT update lecture (requires teacher who owns the course or admin)
router.put('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  lectureController.updateLecture
);

// DELETE lecture (requires teacher who owns the course or admin)
router.delete('/:id', 
  authMiddleware.verifyToken, 
  authMiddleware.isTeacherOrAdmin, 
  lectureController.deleteLecture
);

module.exports = router; 