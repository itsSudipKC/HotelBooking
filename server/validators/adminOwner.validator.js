import { body, param, query } from 'express-validator';

export const listOwnersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('status').optional().isIn(['active', 'suspended']).withMessage('Invalid status'),
];

export const ownerIdParamValidator = [param('id').notEmpty().withMessage('Owner id is required')];

export const createOwnerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^\+?[0-9]{7,15}$/)
    .withMessage('Phone number must be 7-15 digits, optionally starting with +'),
  body('businessName').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
];
