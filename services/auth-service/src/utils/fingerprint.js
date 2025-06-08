/**
 * Device fingerprinting utilities
 * These functions help with identifying and tracking user devices
 */

/**
 * Generate a basic fingerprint from request data
 * This is a fallback when no client-side fingerprint is provided
 * Note: This is NOT secure for production use - it's for development/testing only
 * 
 * @param {Object} req - Express request object
 * @returns {String} A basic fingerprint string
 */
function generateBasicFingerprint(req) {
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.ip || req.connection.remoteAddress || '';
  const acceptLanguage = req.headers['accept-language'] || '';
  
  // Create a simple hash from these values
  // In production, use a more sophisticated fingerprinting solution
  const fingerprintStr = `${userAgent}|${ip}|${acceptLanguage}`;
  return Buffer.from(fingerprintStr).toString('base64');
}

/**
 * Validate a fingerprint against a stored one
 * In development mode, this can be configured to always return true
 * 
 * @param {String} storedFingerprint - The fingerprint stored for the user
 * @param {String} providedFingerprint - The fingerprint provided in the request
 * @param {Boolean} strictMode - Whether to enforce strict matching
 * @returns {Boolean} Whether the fingerprints match or validation is bypassed
 */
function validateFingerprint(storedFingerprint, providedFingerprint, strictMode = false) {
  if (!strictMode) {
    return true; // Development mode - bypass validation
  }
  
  if (!storedFingerprint || !providedFingerprint) {
    return true; // If either fingerprint is missing, validation passes
  }
  
  return storedFingerprint === providedFingerprint;
}

module.exports = {
  generateBasicFingerprint,
  validateFingerprint
}; 