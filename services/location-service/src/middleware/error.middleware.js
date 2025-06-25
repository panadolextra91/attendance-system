const { ValidationError } = require('express-validator');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Handle validation errors
  if (err instanceof ValidationError) {
    const errors = {};
    err.errors.forEach(error => {
      const field = error.path || 'general';
      if (!errors[field]) {
        errors[field] = [];
      }
      errors[field].push(error.msg);
    });
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors
    });
  }

  // Handle custom errors
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Handle Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      status: 'error',
      message: 'A record with this data already exists',
      fields: err.meta?.target || []
    });
  }

  // Handle other database errors
  if (err.code?.startsWith('P')) {
    return res.status(400).json({
      status: 'error',
      message: 'Database error',
      code: err.code
    });
  }

  // Default error handler
  res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
