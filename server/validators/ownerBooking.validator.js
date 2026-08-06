import { body, param, query } from 'express-validator';

export const listOwnerBookingsValidator = [
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'rejected', 'completed']).withMessage('Invalid status'),
];

export const ownerBookingIdParamValidator = [param('id').notEmpty().withMessage('Booking id is required')];

export const rejectBookingValidator = [
  param('id').notEmpty().withMessage('Booking id is required'),
  body('reason').trim().notEmpty().withMessage('A rejection reason is required').isLength({ max: 500 }),
];
