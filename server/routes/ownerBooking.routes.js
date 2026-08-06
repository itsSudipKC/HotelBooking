import { Router } from 'express';
import { listBookingsForOwner, getOwnerBookingById, acceptBooking, rejectBooking } from '../controllers/ownerBooking.controller.js';
import { listOwnerBookingsValidator, ownerBookingIdParamValidator, rejectBookingValidator } from '../validators/ownerBooking.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('owner'));

router.get('/', listOwnerBookingsValidator, validate, listBookingsForOwner);
router.get('/:id', ownerBookingIdParamValidator, validate, getOwnerBookingById);
router.patch('/:id/accept', ownerBookingIdParamValidator, validate, acceptBooking);
router.patch('/:id/reject', rejectBookingValidator, validate, rejectBooking);

export default router;
