import { Router } from 'express';
import { buildAuthController } from '../controllers/auth.controller.js';
import User from '../models/User.model.js';
import { sendWelcomeUserEmail } from '../services/email.service.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} from '../validators/auth.validator.js';
import validate from '../middleware/validate.middleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getMe,
} = buildAuthController({
  role: 'user',
  Model: User,
  accountModel: 'User',
  sendWelcomeEmail: sendWelcomeUserEmail,
});

router.post('/register', authRateLimiter, registerValidator, validate, register);
router.get('/verify-email/:token', verifyEmailValidator, validate, verifyEmail);
router.post('/login', authRateLimiter, loginValidator, validate, login);
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post('/reset-password/:token', authRateLimiter, resetPasswordValidator, validate, resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/me', verifyJWT, authorizeRoles('user'), getMe);

export default router;
