import { Request, Response } from 'express';
import { EventService } from '../services/eventService';
import { ApiResponse } from '../types';

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  async getAllEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await this.eventService.getAllEvents();
      
      const response: ApiResponse = {
        success: true,
        data: events,
        message: 'Events retrieved successfully'
      };
      res.status(200).json(response);

    } catch (error) {
      console.error('Error in getAllEvents controller:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
      res.status(500).json(response);
    }
  }

  async getEventById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const eventId = parseInt(id);
      
      if (isNaN(eventId)) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid event ID'
        };
        res.status(400).json(response);
        return;
      }

      const event = await this.eventService.getEventById(eventId);
      
      if (!event) {
        const response: ApiResponse = {
          success: false,
          error: 'EVENT_NOT_FOUND',
          message: 'Event not found'
        };
        res.status(404).json(response);
        return;
      }

      const availableSeats = await this.eventService.getAvailableSeats(eventId);
      
      const eventWithAvailability = {
        ...event,
        available_seats: availableSeats,
        is_full: availableSeats === 0
      };

      const response: ApiResponse = {
        success: true,
        data: eventWithAvailability,
        message: 'Event retrieved successfully'
      };
      res.status(200).json(response);

    } catch (error) {
      console.error('Error in getEventById controller:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
      res.status(500).json(response);
    }
  }
}
