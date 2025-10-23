import { Router } from 'express';
import { EventController } from '../controllers/eventController';

const router = Router();
const eventController = new EventController();

// GET /api/events - Получение всех событий
router.get('/', (req, res) => {
  eventController.getAllEvents(req, res);
});

// GET /api/events/:id - Получение события по ID
router.get('/:id', (req, res) => {
  eventController.getEventById(req, res);
});

export default router;
