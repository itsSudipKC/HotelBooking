import { param, query } from 'express-validator';

export const listUsersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
  query('status').optional().isIn(['active', 'suspended']).withMessage('Invalid status'),
];

export const userIdParamValidator = [param('id').notEmpty().withMessage('User id is required')];
