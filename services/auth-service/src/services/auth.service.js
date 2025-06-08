const userService = require('./user.service');
// We'll use bcrypt for password hashing
const bcrypt = require('bcrypt');
// For JWT token generation
const jwt = require('jsonwebtoken');
// For storing refresh tokens (in a real application, this would be in a database)
const refreshTokens = new Map();
// Import fingerprint validation
const { validateFingerprint } = require('../utils/fingerprint');

/**
 * Authentication service responsible for user registration, login, and token management.
 * 
 * Device Fingerprinting:
 * ---------------------
 * Current implementation expects the client to send a device fingerprint during registration/login.
 * 
 * Future Implementation Plan:
 * 1. Integrate a fingerprinting library like FingerprintJS on the client side
 * 2. Generate a consistent device identifier based on browser/device characteristics
 * 3. Send this identifier automatically with auth requests
 * 4. Consider implementing IP-based validation as an additional layer
 * 5. Add device management UI for users to view/manage their authorized devices
 */
class AuthService {
  constructor() {
    this.saltRounds = 10;
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key-for-development-change-in-production';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-for-development-change-in-production';
    this.jwtExpiration = process.env.JWT_EXPIRATION || '15m'; // Shorter access token lifetime
    this.jwtRefreshExpiration = process.env.JWT_REFRESH_EXPIRATION || '7d'; // Longer refresh token lifetime
    // Enable/disable strict fingerprint validation (set to false in development for easier testing)
    this.strictFingerprintValidation = process.env.NODE_ENV === 'production';
  }

  async register(userData) {
    try {
      // Check if user exists
      const existingUser = await userService.findByEmail(userData.email);
      
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Validate required fields based on role
      this.validateProfileFields(userData);
      
      // Hash password if provided
      if (userData.password) {
        userData.password = await this.hashPassword(userData.password);
      }
      
      // Create user
      const user = await userService.create(userData);
      
      // Return user without sensitive data
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error in register service:', error);
      throw error;
    }
  }

  validateProfileFields(userData) {
    // Validate required fields based on role
    if (userData.role === 'STUDENT') {
      if (!userData.studentProfile) {
        throw new Error('Student profile data is required');
      }
      if (!userData.studentProfile.studentId) {
        throw new Error('Student ID is required');
      }
      if (!userData.studentProfile.enrollmentYear) {
        throw new Error('Enrollment year is required');
      }
    } else if (userData.role === 'TEACHER') {
      if (!userData.teacherProfile) {
        throw new Error('Teacher profile data is required');
      }
      if (!userData.teacherProfile.teacherId) {
        throw new Error('Teacher ID is required');
      }
    }
    // Admin profile doesn't have required fields
  }

  async login(email, password, deviceFingerprint) {
    try {
      // Find user
      const user = await userService.findByEmail(email);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Validate password
      const isPasswordValid = await this.validatePassword(password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }
      
      // Check device fingerprint using the validation utility
      const fingerprintValid = validateFingerprint(
        user.deviceFingerprint, 
        deviceFingerprint, 
        this.strictFingerprintValidation
      );
      
      if (!fingerprintValid) {
        throw new Error('This account is already registered on another device');
      }
      
      // Update device fingerprint if provided and not set
      if (deviceFingerprint && !user.deviceFingerprint) {
        await userService.update(user.id, { deviceFingerprint });
      }
      
      // Generate tokens
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      
      // Store refresh token
      this.storeRefreshToken(user.id, refreshToken);
      
      // Return user with tokens
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: this.sanitizeUser(user)
      };
    } catch (error) {
      console.error('Error in login service:', error);
      throw error;
    }
  }

  /**
   * Get device information helper method (for future implementation)
   * This would be used to extract and format device information when
   * automatic fingerprinting is implemented.
   * 
   * @param {Object} requestInfo - Information from the request (headers, IP, etc.)
   * @returns {Object} Structured device information
   */
  getDeviceInfo(requestInfo) {
    // This is a placeholder for future implementation
    // In production, this would extract useful device information
    // from request headers, user agent, and other sources
    
    return {
      userAgent: requestInfo.userAgent,
      ip: requestInfo.ip,
      timestamp: new Date().toISOString()
    };
  }

  async getUserProfile(userId) {
    try {
      const user = await userService.findById(userId);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return this.sanitizeUser(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  sanitizeUser(user) {
    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;
    
    // Add profile data based on role
    let profile = null;
    
    if (user.role === 'STUDENT' && user.studentProfile) {
      profile = user.studentProfile;
    } else if (user.role === 'TEACHER' && user.teacherProfile) {
      profile = user.teacherProfile;
    } else if (user.role === 'ADMIN' && user.adminProfile) {
      profile = user.adminProfile;
    }
    
    return {
      ...userWithoutPassword,
      profile
    };
  }

  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret);
      const userId = decoded.sub;
      
      // Check if refresh token exists in storage
      const storedToken = refreshTokens.get(userId);
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }
      
      // Get user
      const user = await userService.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Generate new access token
      const accessToken = this.generateAccessToken(user);
      
      return {
        access_token: accessToken
      };
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  async logout(userId) {
    try {
      // Remove refresh token from storage
      refreshTokens.delete(userId);
      return true;
    } catch (error) {
      console.error('Error in logout service:', error);
      throw error;
    }
  }

  validatePasswordStrength(password) {
    // No password constraints
    if (!password) {
      throw new Error('Password is required');
    }
    return true;
  }

  async hashPassword(password) {
    return bcrypt.hash(password, this.saltRounds);
  }

  async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  generateAccessToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    };
    
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiration
    });
  }

  generateRefreshToken(user) {
    const payload = {
      sub: user.id,
      type: 'refresh'
    };
    
    return jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.jwtRefreshExpiration
    });
  }

  storeRefreshToken(userId, refreshToken) {
    refreshTokens.set(userId, refreshToken);
  }

  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Ensure it's an access token
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      console.error('Error verifying access token:', error);
      throw error;
    }
  }
}

// Singleton instance
const authService = new AuthService();

module.exports = authService; 