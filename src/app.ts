import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';
import eventRoutes from './routes/eventRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';

dotenv.config();

const app = express();

// Middleware для безопасности
app.use(helmet());

// CORS настройки
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') 
    : true,
  credentials: true
}));

// JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Логирование запросов
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Маршруты
app.use('/api/bookings', bookingRoutes);
app.use('/api/events', eventRoutes);

// Обработка ошибок
app.use(notFoundHandler);

app.use(errorHandler);

export default app;
