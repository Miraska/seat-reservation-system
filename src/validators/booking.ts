import Joi from 'joi';
import { BookingRequest } from '../types';

export const bookingRequestSchema = Joi.object<BookingRequest>({
  event_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Event ID must be a number',
      'number.integer': 'Event ID must be an integer',
      'number.positive': 'Event ID must be positive',
      'any.required': 'Event ID is required'
    }),
  user_id: Joi.string().min(1).max(255).required()
    .messages({
      'string.base': 'User ID must be a string',
      'string.min': 'User ID cannot be empty',
      'string.max': 'User ID cannot exceed 255 characters',
      'any.required': 'User ID is required'
    })
});

export const validateBookingRequest = (data: any): { error?: string; value?: BookingRequest } => {
  const { error, value } = bookingRequestSchema.validate(data, { abortEarly: false });
  
  if (error) {
    const errorMessage = error.details.map(detail => detail.message).join(', ');
    return { error: errorMessage };
  }
  
  return { value };
};
