import { body } from 'express-validator';

export const createReviewValidator = [
  body('hotelId').notEmpty().withMessage('Hotel id is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment must be under 1000 characters'),
];
