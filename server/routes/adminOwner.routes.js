import { Router } from 'express';
import {
  listOwners,
  getOwnerById,
  createOwner,
  suspendOwner,
  activateOwner,
  deleteOwner,
} from '../controllers/adminOwner.controller.js';
import { listOwnersValidator, ownerIdParamValidator, createOwnerValidator } from '../validators/adminOwner.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('admin'));

router.get('/', listOwnersValidator, validate, listOwners);
router.post('/', createOwnerValidator, validate, createOwner);
router.get('/:id', ownerIdParamValidator, validate, getOwnerById);
router.patch('/:id/suspend', ownerIdParamValidator, validate, suspendOwner);
router.patch('/:id/activate', ownerIdParamValidator, validate, activateOwner);
router.delete('/:id', ownerIdParamValidator, validate, deleteOwner);

export default router;
