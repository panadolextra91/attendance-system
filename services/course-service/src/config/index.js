require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-for-development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/attendance?schema=course',
  },
  services: {
    locationServiceUrl: process.env.LOCATION_SERVICE_URL || 'http://localhost:3003',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
};
