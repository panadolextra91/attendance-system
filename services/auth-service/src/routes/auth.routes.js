const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.get('/health', authController.health.bind(authController));

// Protected routes
router.get('/profile', 
  authMiddleware.authenticate.bind(authMiddleware), 
  authController.profile.bind(authController)
);

router.post('/logout',
  authMiddleware.authenticate.bind(authMiddleware),
  authController.logout.bind(authController)
);

// Role-based routes returning users filtered by role
router.get('/admin',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorize(['ADMIN']),
  userController.getAdmins.bind(userController)
);

router.get('/teacher',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorize(['TEACHER', 'ADMIN']),
  userController.getTeachers.bind(userController)
);

router.get('/student',
  authMiddleware.authenticate.bind(authMiddleware),
  authMiddleware.authorize(['STUDENT', 'TEACHER', 'ADMIN']),
  userController.getStudents.bind(userController)
);

module.exports = router; 