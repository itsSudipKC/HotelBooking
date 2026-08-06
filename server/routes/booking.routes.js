import { Router } from 'express';
import { createBooking, listMyBookings, getMyBookingById, cancelBooking } from '../controllers/booking.controller.js';
import { createBookingValidator, bookingIdParamValidator } from '../validators/booking.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('user'));

router.post('/', createBookingValidator, validate, createBooking);
router.get('/my', listMyBookings);
router.get('/my/:id', bookingIdParamValidator, validate, getMyBookingById);
router.patch('/my/:id/cancel', bookingIdParamValidator, validate, cancelBooking);

export default router;
