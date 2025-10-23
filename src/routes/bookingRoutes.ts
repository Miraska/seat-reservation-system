import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();
const bookingController = new BookingController();

// POST /api/bookings/reserve - Создание бронирования
router.post('/reserve', (req, res) => {
  bookingController.reserveBooking(req, res);
});

// GET /api/bookings/user/:userId - Получение бронирований пользователя
router.get('/user/:userId', (req, res) => {
  bookingController.getUserBookings(req, res);
});

// GET /api/bookings/event/:eventId - Получение бронирований события
router.get('/event/:eventId', (req, res) => {
  bookingController.getEventBookings(req, res);
});

export default router;
