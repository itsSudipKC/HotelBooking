import { Router } from 'express';
import { toggleWishlist, getWishlistStatus, listMyWishlist } from '../controllers/wishlist.controller.js';
import { hotelIdParamValidator } from '../validators/wishlist.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.use(verifyJWT, authorizeRoles('user'));

router.get('/my', listMyWishlist);
router.get('/status/:hotelId', hotelIdParamValidator, validate, getWishlistStatus);
router.patch('/toggle/:hotelId', hotelIdParamValidator, validate, toggleWishlist);

export default router;
