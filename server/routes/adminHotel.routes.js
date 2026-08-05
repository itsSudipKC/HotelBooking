import { Router } from 'express';
import {
  listHotels,
  getHotelById,
  approveHotel,
  rejectHotel,
  deleteHotel,
} from '../controllers/adminHotel.controller.js';
import {
  listAdminHotelsValidator,
  adminHotelIdParamValidator,
  rejectHotelValidator,
} from '../validators/adminHotel.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('admin'));

router.get('/', listAdminHotelsValidator, validate, listHotels);
router.get('/:id', adminHotelIdParamValidator, validate, getHotelById);
router.patch('/:id/approve', adminHotelIdParamValidator, validate, approveHotel);
router.patch('/:id/reject', rejectHotelValidator, validate, rejectHotel);
router.delete('/:id', adminHotelIdParamValidator, validate, deleteHotel);

export default router;
