import { param, query } from 'express-validator';

export const listHotelsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('sort')
    .optional()
    .isIn(['price_asc', 'price_desc', 'rating', 'newest'])
    .withMessage('Invalid sort value'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a non-negative number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a non-negative number'),
  query('rating').optional().isFloat({ min: 0, max: 5 }).withMessage('rating must be between 0 and 5'),
];

export const hotelIdParamValidator = [param('id').notEmpty().withMessage('Hotel id is required')];
