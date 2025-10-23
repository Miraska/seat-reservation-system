import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

process.env.NODE_ENV = 'test';
process.env.DB_NAME = 'booking_system_test';
process.env.LOG_LEVEL = 'error';
