import { Router } from 'express';
import { updateRoom, deleteRoom, toggleRoomActive } from '../controllers/ownerRoom.controller.js';
import { roomIdParamValidator, roomFormValidator } from '../validators/ownerRoom.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('owner'));

router.put('/:id', roomIdParamValidator, roomFormValidator, validate, updateRoom);
router.delete('/:id', roomIdParamValidator, validate, deleteRoom);
router.patch('/:id/toggle-active', roomIdParamValidator, validate, toggleRoomActive);

export default router;
