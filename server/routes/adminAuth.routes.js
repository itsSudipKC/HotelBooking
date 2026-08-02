import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { loginValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/auth.validator.js';
import validate from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

// No /register route: Admin accounts are created only via scripts/seedAdmin.js.
router.post('/login', authRateLimiter, loginValidator, validate, adminController.login);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, adminController.forgotPassword);
router.post('/reset-password/:token', authRateLimiter, resetPasswordValidator, validate, adminController.resetPassword);
router.post('/refresh-token', adminController.refreshToken);
router.post('/logout', adminController.logout);
router.get('/me', verifyJWT, authorizeRoles('admin'), adminController.getMe);

export default router;
