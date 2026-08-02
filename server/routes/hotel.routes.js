import { Router } from 'express';
import { listHotels, getFeaturedHotels, getHotelById, getSimilarHotels } from '../controllers/hotel.controller.js';
import { listReviewsForHotel } from '../controllers/review.controller.js';
import { listHotelsValidator, hotelIdParamValidator } from '../validators/hotel.validator.js';
import validate from '../middleware/validate.middleware.js';

const router = Router();

router.get('/', listHotelsValidator, validate, listHotels);
router.get('/featured', getFeaturedHotels);
router.get('/:id', hotelIdParamValidator, validate, getHotelById);
router.get('/:id/similar', hotelIdParamValidator, validate, getSimilarHotels);
router.get('/:id/reviews', hotelIdParamValidator, validate, listReviewsForHotel);

export default router;
