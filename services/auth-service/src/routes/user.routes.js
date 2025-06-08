const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Public routes - generally all user routes should be protected
// but we'll keep the get all users route public for demonstration
router.get('/', userController.getAllUsers.bind(userController));

// Protected routes
router.get('/:id',
  authMiddleware.authenticate.bind(authMiddleware),
  userController.getUserById.bind(userController)
);

router.put('/:id',
  authMiddleware.authenticate.bind(authMiddleware),
  // Only admin can update users (except their own profile)
  (req, res, next) => {
    // Allow users to update their own profile
    if (req.user.id === req.params.id) {
      return next();
    }
    // Otherwise apply authorization
    return authMiddleware.authorize(['ADMIN'])(req, res, next);
  },
  userController.updateUser.bind(userController)
);

router.delete('/:id',
  authMiddleware.authenticate.bind(authMiddleware),
  // Only admin can delete users
  authMiddleware.authorize(['ADMIN']),
  userController.deleteUser.bind(userController)
);

module.exports = router; 