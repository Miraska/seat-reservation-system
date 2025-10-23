import request from 'supertest';
import app from '../app';
import pool from '../config/database';

describe('Booking API', () => {
  beforeAll(async () => {
    // Подключение к тестовой базе данных
    await pool.query('SELECT NOW()');
  });

  afterAll(async () => {
    // Закрытие соединения с базой данных
    await pool.end();
  });

  beforeEach(async () => {
    // Очистка таблиц перед каждым тестом
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    
    // Вставка тестовых данных
    await pool.query(`
      INSERT INTO events (id, name, total_seats) VALUES 
      (1, 'Test Event 1', 10),
      (2, 'Test Event 2', 5)
    `);
  });

  describe('POST /api/bookings/reserve', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        event_id: 1,
        user_id: 'user123'
      };

      const response = await request(app)
        .post('/api/bookings/reserve')
        .send(bookingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.event_id).toBe(1);
      expect(response.body.data.user_id).toBe('user123');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        event_id: 'invalid',
        user_id: ''
      };

      const response = await request(app)
        .post('/api/bookings/reserve')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent event', async () => {
      const bookingData = {
        event_id: 999,
        user_id: 'user123'
      };

      const response = await request(app)
        .post('/api/bookings/reserve')
        .send(bookingData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EVENT_NOT_FOUND');
    });

    it('should return 409 for duplicate booking', async () => {
      const bookingData = {
        event_id: 1,
        user_id: 'user123'
      };

      // Первое бронирование
      await request(app)
        .post('/api/bookings/reserve')
        .send(bookingData)
        .expect(201);

      // Попытка повторного бронирования
      const response = await request(app)
        .post('/api/bookings/reserve')
        .send(bookingData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('ALREADY_BOOKED');
    });

    it('should return 409 when event is full', async () => {
      // Заполняем все места
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/bookings/reserve')
          .send({
            event_id: 2,
            user_id: `user${i}`
          })
          .expect(201);
      }

      // Попытка забронировать место в заполненном событии
      const response = await request(app)
        .post('/api/bookings/reserve')
        .send({
          event_id: 2,
          user_id: 'user6'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EVENT_FULL');
    });
  });

  describe('GET /api/bookings/user/:userId', () => {
    it('should return user bookings', async () => {
      // Создаем бронирование
      await request(app)
        .post('/api/bookings/reserve')
        .send({
          event_id: 1,
          user_id: 'user123'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/bookings/user/user123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].user_id).toBe('user123');
    });
  });

  describe('GET /api/bookings/event/:eventId', () => {
    it('should return event bookings', async () => {
      // Создаем бронирование
      await request(app)
        .post('/api/bookings/reserve')
        .send({
          event_id: 1,
          user_id: 'user123'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/bookings/event/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].event_id).toBe(1);
    });
  });
});
