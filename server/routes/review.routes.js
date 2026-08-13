import { Router } from 'express';
import { createReview } from '../controllers/review.controller.js';
import { createReviewValidator } from '../validators/review.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// User-only, deliberately — owners/admins have no review-writing route
// anywhere in this app (see review.controller.js).
router.use(verifyJWT, authorizeRoles('user'));
router.post('/', createReviewValidator, validate, createReview);

export default router;
