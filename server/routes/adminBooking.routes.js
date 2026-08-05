import { Router } from 'express';
import { query, param } from 'express-validator';
import { listBookings, getBookingById } from '../controllers/adminBooking.controller.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('admin'));

router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'rejected', 'completed']),
  ],
  validate,
  listBookings
);
router.get('/:id', [param('id').notEmpty()], validate, getBookingById);

export default router;
