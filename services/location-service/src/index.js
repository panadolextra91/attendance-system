require('dotenv').config();
const { app, server } = require('./app');
const dbService = require('./services/db.service');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3003;

// Connect to database and start server
const startServer = async () => {
  try {
    const isConnected = await dbService.connect();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }
    logger.info('Database connected');
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down server...');
  
  try {
    const prisma = dbService.getClient();
    await prisma.$disconnect();
    server.close(() => {
      logger.info('Server stopped');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();
