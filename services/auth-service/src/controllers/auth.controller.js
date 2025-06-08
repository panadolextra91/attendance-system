const authService = require('../services/auth.service');
const { generateBasicFingerprint } = require('../utils/fingerprint');

class AuthController {
  /**
   * Generate a basic fingerprint from request data
   * This is a fallback when no client-side fingerprint is provided
   * Note: This is NOT secure for production use - it's for development/testing only
   * 
   * @param {Object} req - Express request object
   * @returns {String} A basic fingerprint string
   */
  generateBasicFingerprint(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    
    // Create a simple hash from these values
    // In production, use a more sophisticated fingerprinting solution
    const fingerprintStr = `${userAgent}|${ip}|${acceptLanguage}`;
    return Buffer.from(fingerprintStr).toString('base64');
  }

  async register(req, res) {
    try {
      const { 
        email, 
        password, 
        role, 
        firstName, 
        lastName, 
        deviceFingerprint,
        // Profile-specific fields
        studentId,
        enrollmentYear,
        major,
        teacherId,
        department,
        adminLevel
      } = req.body;
      
      // Prepare user data
      const userData = {
        email,
        password,
        role,
        firstName,
        lastName,
        // Use provided fingerprint or generate a basic one from request info
        deviceFingerprint: deviceFingerprint || generateBasicFingerprint(req)
      };
      
      // Add appropriate profile data based on role
      if (role === 'STUDENT') {
        userData.studentProfile = {
          studentId,
          enrollmentYear: enrollmentYear ? parseInt(enrollmentYear) : null,
          major
        };
      } else if (role === 'TEACHER') {
        userData.teacherProfile = {
          teacherId,
          department
        };
      } else if (role === 'ADMIN') {
        userData.adminProfile = {
          adminLevel: adminLevel ? parseInt(adminLevel) : 1
        };
      }
      
      const user = await authService.register(userData);
      
      return res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      console.error('Error in register controller:', error);
      
      if (error.message === 'User already exists' || 
          error.message === 'Password is required') {
        return res.status(400).json({ error: error.message });
      }
      
      // Handle validation errors for profile fields
      if (error.message.includes('required')) {
        return res.status(400).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { email, password, deviceFingerprint } = req.body;
      
      // Use provided fingerprint or generate basic one
      const fingerprint = deviceFingerprint || generateBasicFingerprint(req);
      
      const result = await authService.login(email, password, fingerprint);
      
      return res.json(result);
    } catch (error) {
      console.error('Error in login controller:', error);
      
      if (error.message === 'Invalid credentials' || 
          error.message === 'This account is already registered on another device') {
        return res.status(401).json({ error: error.message });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      
      if (!refresh_token) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }
      
      const result = await authService.refreshToken(refresh_token);
      
      return res.json(result);
    } catch (error) {
      console.error('Error in refreshToken controller:', error);
      
      if (error.message === 'Invalid refresh token' || 
          error.message === 'User not found' ||
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
      }
      
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async logout(req, res) {
    try {
      const userId = req.user.id;
      
      await authService.logout(userId);
      
      return res.json({ message: 'Logout successful' });
    } catch (error) {
      console.error('Error in logout controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  async profile(req, res) {
    try {
      // User should be available from the auth middleware
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      // Get full profile information
      const userWithProfile = await authService.getUserProfile(user.id);
      
      return res.json(userWithProfile);
    } catch (error) {
      console.error('Error in profile controller:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Health check endpoint
  health(req, res) {
    res.json({ status: 'ok', service: 'auth-service' });
  }
}

// Singleton instance
const authController = new AuthController();

module.exports = authController; 