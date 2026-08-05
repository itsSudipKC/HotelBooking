import { body, param } from 'express-validator';

export const hotelIdParamValidator = [param('hotelId').notEmpty().withMessage('Hotel id is required')];
export const roomIdParamValidator = [param('id').notEmpty().withMessage('Room id is required')];

export const roomFormValidator = [
  body('type').trim().notEmpty().withMessage('Room type is required').isLength({ max: 60 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('totalRooms').isInt({ min: 1 }).withMessage('Total rooms must be at least 1'),
  body('amenities').optional().isArray().withMessage('Amenities must be a list'),
  body('imageUrls').optional().isArray().withMessage('Images must be a list'),
];
