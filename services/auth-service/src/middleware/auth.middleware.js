const authService = require('../services/auth.service');
const userService = require('../services/user.service');

class AuthMiddleware {
  // JWT authentication middleware
  async authenticate(req, res, next) {
    try {
      // Get the token from the Authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }
      
      // Extract the token
      const token = authHeader.split(' ')[1];
      
      // Verify the token
      const decoded = authService.verifyAccessToken(token);
      
      // Find the user
      const user = await userService.findById(decoded.sub);
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
      
      // Attach the user to the request
      req.user = user;
      
      // Continue to the next middleware or controller
      next();
    } catch (error) {
      console.error('Error in authenticate middleware:', error);
      
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Unauthorized: Token expired' });
      } else if (error.message === 'Invalid token type') {
        return res.status(401).json({ error: 'Unauthorized: Invalid token type' });
      } else {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }
    }
  }

  // Role-based authorization middleware
  authorize(roles = []) {
    return (req, res, next) => {
      try {
        // User should be available from the authenticate middleware
        if (!req.user) {
          return res.status(401).json({ error: 'Unauthorized' });
        }
        
        // Check if user's role is included in the allowed roles
        if (roles.length && !roles.includes(req.user.role)) {
          return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        
        // Continue to the next middleware or controller
        next();
      } catch (error) {
        console.error('Error in authorize middleware:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    };
  }
}

// Singleton instance
const authMiddleware = new AuthMiddleware();

module.exports = authMiddleware; 