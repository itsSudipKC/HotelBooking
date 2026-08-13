import { Router } from 'express';
import {
  listHotels,
  getFeaturedHotels,
  getRecommendedForMe,
  getHotelById,
  getSimilarHotels,
  chatWithHotel,
} from '../controllers/hotel.controller.js';
import { listReviewsForHotel } from '../controllers/review.controller.js';
import { listHotelsValidator, hotelIdParamValidator, chatQuestionValidator } from '../validators/hotel.validator.js';
import validate from '../middleware/validate.middleware.js';
import { verifyJWT, authorizeRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', listHotelsValidator, validate, listHotels);
router.get('/featured', getFeaturedHotels);
// Must be registered before '/:id' — otherwise Express would capture
// "recommended" as the :id param.
router.get('/recommended', verifyJWT, authorizeRoles('user'), getRecommendedForMe);
router.get('/:id', hotelIdParamValidator, validate, getHotelById);
router.get('/:id/similar', hotelIdParamValidator, validate, getSimilarHotels);
router.get('/:id/reviews', hotelIdParamValidator, validate, listReviewsForHotel);
router.post('/:id/chat', hotelIdParamValidator, chatQuestionValidator, validate, chatWithHotel);

export default router;
