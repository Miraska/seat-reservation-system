import app from './app';
import pool from './config/database';
import redisClient from './config/redis';
import rabbitmqService from './config/rabbitmq';
import logger from './middleware/logger';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Подключение к базе данных
    await pool.query('SELECT NOW()');
    logger.info('Connected to PostgreSQL database');

    // Подключение к Redis
    await redisClient.connect();
    logger.info('Connected to Redis');

    // Подключение к RabbitMQ
    await rabbitmqService.connect();
    logger.info('Connected to RabbitMQ');

    // Запуск сервера
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Обработчики завершения тасков
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  try {
    await pool.end();
    await redisClient.quit();
    await rabbitmqService.close();
    logger.info('All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  
  try {
    await pool.end();
    await redisClient.quit();
    await rabbitmqService.close();
    logger.info('All connections closed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
