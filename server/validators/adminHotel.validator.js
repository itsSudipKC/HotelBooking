import { body, param, query } from 'express-validator';

export const listAdminHotelsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('sort').optional().isIn(['price_asc', 'price_desc', 'rating', 'newest']).withMessage('Invalid sort value'),
];

export const adminHotelIdParamValidator = [param('id').notEmpty().withMessage('Hotel id is required')];

export const rejectHotelValidator = [
  param('id').notEmpty().withMessage('Hotel id is required'),
  body('reason').trim().notEmpty().withMessage('A rejection reason is required').isLength({ max: 500 }),
];
