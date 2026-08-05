import { body, param } from 'express-validator';

export const hotelIdParamValidator = [param('id').notEmpty().withMessage('Hotel id is required')];

export const hotelFormValidator = [
  body('name').trim().notEmpty().withMessage('Hotel name is required').isLength({ max: 120 }),
  body('description').trim().notEmpty().withMessage('Description is required').isLength({ max: 3000 }),
  body('category').optional({ values: 'falsy' }).trim().isLength({ max: 60 }),
  body('starRating').optional().isInt({ min: 1, max: 5 }).withMessage('Star rating must be 1-5'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  body('street').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('amenities').optional().isArray().withMessage('Amenities must be a list'),
  body('imageUrls').optional().isArray().withMessage('Images must be a list'),
];
