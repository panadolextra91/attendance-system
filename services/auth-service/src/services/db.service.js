const { PrismaClient } = require('../../generated/prisma');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  async connect() {
    try {
      await this.prisma.$connect();
      console.log('Connected to database successfully');
      return true;
    } catch (error) {
      console.error('Failed to connect to database:', error);
      return false;
    }
  }

  async disconnect() {
    await this.prisma.$disconnect();
  }

  getPrismaClient() {
    return this.prisma;
  }
}

// Singleton instance
const dbService = new DatabaseService();

module.exports = dbService; 