import { Router } from 'express';
import { initiatePayment, handleEsewaCallback, handleKhaltiCallback, getPaymentForBooking } from '../controllers/payment.controller.js';
import { initiatePaymentValidator, bookingIdParamValidator } from '../validators/payment.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Public — the gateway redirects the browser here directly, with no bearer
// token available. Both handlers independently re-verify with the gateway
// before trusting anything in the query string.
router.get('/esewa/callback', handleEsewaCallback);
router.get('/khalti/callback', handleKhaltiCallback);

router.use(verifyJWT, authorizeRoles('user'));
router.post('/initiate', initiatePaymentValidator, validate, initiatePayment);
router.get('/booking/:bookingId', bookingIdParamValidator, validate, getPaymentForBooking);

export default router;
