import { body, param } from 'express-validator';

export const initiatePaymentValidator = [
  body('bookingId').notEmpty().withMessage('Booking id is required'),
  body('method').isIn(['esewa', 'khalti']).withMessage('Payment method must be esewa or khalti'),
];

export const bookingIdParamValidator = [param('bookingId').notEmpty().withMessage('Booking id is required')];
