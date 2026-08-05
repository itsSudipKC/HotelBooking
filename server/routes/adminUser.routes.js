import { Router } from 'express';
import { listUsers, getUserById, suspendUser, activateUser, deleteUser } from '../controllers/adminUser.controller.js';
import { listUsersValidator, userIdParamValidator } from '../validators/adminUser.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('admin'));

router.get('/', listUsersValidator, validate, listUsers);
router.get('/:id', userIdParamValidator, validate, getUserById);
router.patch('/:id/suspend', userIdParamValidator, validate, suspendUser);
router.patch('/:id/activate', userIdParamValidator, validate, activateUser);
router.delete('/:id', userIdParamValidator, validate, deleteUser);

export default router;
