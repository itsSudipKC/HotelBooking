import { param } from 'express-validator';

export const hotelIdParamValidator = [param('hotelId').notEmpty().withMessage('Hotel id is required')];
