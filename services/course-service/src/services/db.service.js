// Database service for the course service
const { PrismaClient } = require('../../generated/prisma');

// Singleton instance of PrismaClient
let prisma;

/**
 * Connect to the database
 * @returns {Promise<boolean>} Whether the connection was successful
 */
const connect = async () => {
  try {
    if (!prisma) {
      prisma = new PrismaClient();
      await prisma.$connect();
      console.log('Connected to database');
    }
    return true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    return false;
  }
};

/**
 * Get the Prisma client
 * @returns {PrismaClient} The Prisma client
 */
const getClient = () => {
  if (!prisma) {
    throw new Error('Database not connected');
  }
  return prisma;
};

module.exports = {
  connect,
  getClient,
}; 