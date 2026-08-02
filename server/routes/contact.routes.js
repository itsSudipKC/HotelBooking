import { Router } from 'express';
import { submitContactMessage } from '../controllers/contact.controller.js';
import { contactValidator } from '../validators/contact.validator.js';
import validate from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/', authRateLimiter, contactValidator, validate, submitContactMessage);

export default router;
