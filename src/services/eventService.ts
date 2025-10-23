import pool from '../config/database';
import { Event } from '../types';

export class EventService {
  async getEventById(id: number): Promise<Event | null> {
    const query = 'SELECT id, name, total_seats FROM events WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }

  async getAllEvents(): Promise<Event[]> {
    const query = 'SELECT id, name, total_seats FROM events ORDER BY id';
    const result = await pool.query(query);
    return result.rows;
  }

  async getAvailableSeats(eventId: number): Promise<number> {
    const query = `
      SELECT 
        e.total_seats,
        COALESCE(COUNT(b.id), 0) as booked_seats
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id
      WHERE e.id = $1
      GROUP BY e.id, e.total_seats
    `;
    
    const result = await pool.query(query, [eventId]);
    
    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }
    
    const { total_seats, booked_seats } = result.rows[0];
    return total_seats - booked_seats;
  }

  async isEventFull(eventId: number): Promise<boolean> {
    const availableSeats = await this.getAvailableSeats(eventId);
    return availableSeats <= 0;
  }
}
