import { Router } from 'express';
import { listMyHotels, getMyHotelById, createHotel, updateHotel, deleteHotel } from '../controllers/ownerHotel.controller.js';
import { listRoomsForHotel, createRoom } from '../controllers/ownerRoom.controller.js';
import { hotelIdParamValidator, hotelFormValidator } from '../validators/ownerHotel.validator.js';
import { hotelIdParamValidator as roomsHotelIdParamValidator, roomFormValidator } from '../validators/ownerRoom.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('owner'));

router.get('/', listMyHotels);
router.post('/', hotelFormValidator, validate, createHotel);
router.get('/:id', hotelIdParamValidator, validate, getMyHotelById);
router.put('/:id', hotelIdParamValidator, hotelFormValidator, validate, updateHotel);
router.delete('/:id', hotelIdParamValidator, validate, deleteHotel);

router.get('/:hotelId/rooms', roomsHotelIdParamValidator, validate, listRoomsForHotel);
router.post('/:hotelId/rooms', roomsHotelIdParamValidator, roomFormValidator, validate, createRoom);

export default router;
