import { Router } from 'express';
import { updateProfile, changePassword, updateAvatar } from '../controllers/userProfile.controller.js';
import { updateProfileValidator, changePasswordValidator, updateAvatarValidator } from '../validators/userProfile.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('user'));

router.patch('/me', updateProfileValidator, validate, updateProfile);
router.patch('/me/password', changePasswordValidator, validate, changePassword);
router.patch('/me/avatar', updateAvatarValidator, validate, updateAvatar);

export default router;
