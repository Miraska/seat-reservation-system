import request from 'supertest';
import app from '../app';
import pool from '../config/database';

describe('Event API', () => {
  beforeAll(async () => {
    await pool.query('SELECT NOW()');
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM events');
    
    await pool.query(`
      INSERT INTO events (id, name, total_seats) VALUES 
      (1, 'Test Event 1', 10),
      (2, 'Test Event 2', 5)
    `);
  });

  describe('GET /api/events', () => {
    it('should return all events', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('id');
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('total_seats');
    });
  });

  describe('GET /api/events/:id', () => {
    it('should return event by id', async () => {
      const response = await request(app)
        .get('/api/events/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(1);
      expect(response.body.data.name).toBe('Test Event 1');
      expect(response.body.data.total_seats).toBe(10);
      expect(response.body.data).toHaveProperty('available_seats');
      expect(response.body.data).toHaveProperty('is_full');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/events/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('EVENT_NOT_FOUND');
    });

    it('should return 400 for invalid event id', async () => {
      const response = await request(app)
        .get('/api/events/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('VALIDATION_ERROR');
    });

    it('should show correct available seats', async () => {
      // Создаем бронирование
      await request(app)
        .post('/api/bookings/reserve')
        .send({
          event_id: 1,
          user_id: 'user123'
        })
        .expect(201);

      const response = await request(app)
        .get('/api/events/1')
        .expect(200);

      expect(response.body.data.available_seats).toBe(9);
      expect(response.body.data.is_full).toBe(false);
    });
  });
});
