import pool from '../config/database';
import redisClient from '../config/redis';
import rabbitmqService from '../config/rabbitmq';
import { EventService } from './eventService';
import { Booking, BookingRequest, BookingResponse } from '../types';

export class BookingService {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async createBooking(bookingRequest: BookingRequest): Promise<BookingResponse> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Проверяем существование события
      const event = await this.eventService.getEventById(bookingRequest.event_id);
      if (!event) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: 'Event not found',
          error: 'EVENT_NOT_FOUND'
        };
      }

      // Проверяем доступность мест
      const isFull = await this.eventService.isEventFull(bookingRequest.event_id);
      if (isFull) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: 'No available seats for this event',
          error: 'EVENT_FULL'
        };
      }

      // Проверяем, не забронировал ли уже пользователь место на это событие
      const existingBooking = await this.checkExistingBooking(
        bookingRequest.event_id, 
        bookingRequest.user_id
      );
      
      if (existingBooking) {
        await client.query('ROLLBACK');
        return {
          success: false,
          message: 'User has already booked a seat for this event',
          error: 'ALREADY_BOOKED'
        };
      }

      // Создаем бронирование
      const insertQuery = `
        INSERT INTO bookings (event_id, user_id, created_at)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        RETURNING id, event_id, user_id, created_at
      `;
      
      const result = await client.query(insertQuery, [
        bookingRequest.event_id,
        bookingRequest.user_id
      ]);

      const booking = result.rows[0];

      await client.query('COMMIT');

      // Кэшируем информацию о бронировании в Redis
      await this.cacheBooking(booking);

      // Отправляем уведомление через RabbitMQ
      await this.sendBookingNotification(booking);

      return {
        success: true,
        message: 'Booking created successfully',
        booking: booking
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating booking:', error);
      
      // Проверяем, является ли ошибка нарушением уникального ограничения
      if (error instanceof Error && error.message.includes('duplicate key value')) {
        return {
          success: false,
          message: 'User has already booked a seat for this event',
          error: 'ALREADY_BOOKED'
        };
      }
      
      return {
        success: false,
        message: 'Internal server error',
        error: 'INTERNAL_ERROR'
      };
    } finally {
      client.release();
    }
  }

  private async checkExistingBooking(eventId: number, userId: string): Promise<Booking | null> {
    const query = 'SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2';
    const result = await pool.query(query, [eventId, userId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  private async cacheBooking(booking: Booking): Promise<void> {
    try {
      const key = `booking:${booking.event_id}:${booking.user_id}`;
      await redisClient.setEx(key, 3600, JSON.stringify(booking)); // Кэш на 1 час
    } catch (error) {
      console.error('Error caching booking:', error);
      // Не прерываем выполнение при ошибке кэширования
    }
  }

  private async sendBookingNotification(booking: Booking): Promise<void> {
    try {
      const message = {
        type: 'booking_created',
        data: {
          booking_id: booking.id,
          event_id: booking.event_id,
          user_id: booking.user_id,
          created_at: booking.created_at
        },
        timestamp: new Date().toISOString()
      };

      await rabbitmqService.publishMessage('booking_notifications', message);
    } catch (error) {
      console.error('Error sending booking notification:', error);
      // Не прерываем выполнение при ошибке отправки уведомления
    }
  }

  async getBookingsByUserId(userId: string): Promise<Booking[]> {
    const query = `
      SELECT b.*, e.name as event_name
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  async getBookingsByEventId(eventId: number): Promise<Booking[]> {
    const query = 'SELECT * FROM bookings WHERE event_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [eventId]);
    return result.rows;
  }
}
