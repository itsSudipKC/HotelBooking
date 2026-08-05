import { body, param } from 'express-validator';

export const createBookingValidator = [
  body('roomId').notEmpty().withMessage('Room id is required'),
  body('checkIn').isISO8601().withMessage('A valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('A valid check-out date is required'),
  body('guests').isInt({ min: 1 }).withMessage('At least 1 guest is required'),
];

export const bookingIdParamValidator = [param('id').notEmpty().withMessage('Booking id is required')];
