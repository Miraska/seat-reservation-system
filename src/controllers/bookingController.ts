import { Request, Response } from 'express';
import { BookingService } from '../services/bookingService';
import { validateBookingRequest } from '../validators/booking';
import { ApiResponse } from '../types';

export class BookingController {
  private bookingService: BookingService;

  constructor() {
    this.bookingService = new BookingService();
  }

  async reserveBooking(req: Request, res: Response): Promise<void> {
    try {
      // Валидация входных данных
      const validation = validateBookingRequest(req.body);
      
      if (validation.error) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: validation.error
        };
        res.status(400).json(response);
        return;
      }

      // Создание бронирования
      const result = await this.bookingService.createBooking(validation.value!);

      if (result.success) {
        const response: ApiResponse = {
          success: true,
          data: result.booking,
          message: result.message
        };
        res.status(201).json(response);
      } else {
        const statusCode = this.getStatusCodeForError(result.error!);
        const response: ApiResponse = {
          success: false,
          error: result.error,
          message: result.message
        };
        res.status(statusCode).json(response);
      }

    } catch (error) {
      console.error('Error in reserveBooking controller:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
      res.status(500).json(response);
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'User ID is required'
        };
        res.status(400).json(response);
        return;
      }

      const bookings = await this.bookingService.getBookingsByUserId(userId);
      
      const response: ApiResponse = {
        success: true,
        data: bookings,
        message: 'Bookings retrieved successfully'
      };
      res.status(200).json(response);

    } catch (error) {
      console.error('Error in getUserBookings controller:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
      res.status(500).json(response);
    }
  }

  async getEventBookings(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const eventIdNum = parseInt(eventId);
      
      if (isNaN(eventIdNum)) {
        const response: ApiResponse = {
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Invalid event ID'
        };
        res.status(400).json(response);
        return;
      }

      const bookings = await this.bookingService.getBookingsByEventId(eventIdNum);
      
      const response: ApiResponse = {
        success: true,
        data: bookings,
        message: 'Event bookings retrieved successfully'
      };
      res.status(200).json(response);

    } catch (error) {
      console.error('Error in getEventBookings controller:', error);
      
      const response: ApiResponse = {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      };
      res.status(500).json(response);
    }
  }

  private getStatusCodeForError(error: string): number {
    switch (error) {
      case 'EVENT_NOT_FOUND':
        return 404;
      case 'EVENT_FULL':
      case 'ALREADY_BOOKED':
        return 409; // Conflict
      case 'VALIDATION_ERROR':
        return 400;
      default:
        return 500;
    }
  }
}
