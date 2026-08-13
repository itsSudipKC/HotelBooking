import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Review from '../models/Review.model.js';
import Hotel from '../models/Hotel.model.js';
import { findEligibleBooking } from '../utils/bookingCompletion.js';

const recalculateHotelRating = async (hotelId) => {
  const [stats] = await Review.aggregate([
    { $match: { hotel: hotelId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Hotel.updateOne(
    { _id: hotelId },
    { avgRating: stats ? Math.round(stats.avg * 10) / 10 : 0, reviewCount: stats?.count || 0 }
  );
};

export const listReviewsForHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const [reviews, total] = await Promise.all([
    Review.find({ hotel: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name avatar')
      .lean(),
    Review.countDocuments({ hotel: id }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      reviews,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    })
  );
});

// Owners/admins have no endpoint that creates, edits, or deletes a review —
// this is the only write path into the Review collection, and it's
// user-only (see review.routes.js).
export const createReview = asyncHandler(async (req, res) => {
  const { hotelId, rating, comment } = req.body;
  if (!mongoose.isValidObjectId(hotelId)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: hotelId, status: 'approved' });
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const eligibleBooking = await findEligibleBooking(req.account._id, hotelId);
  if (!eligibleBooking) {
    throw new ApiError(403, 'You can review a hotel only after completing a stay there');
  }

  const alreadyReviewed = await Review.findOne({ user: req.account._id, hotel: hotelId });
  if (alreadyReviewed) {
    throw new ApiError(400, "You've already reviewed this hotel");
  }

  const review = await Review.create({
    user: req.account._id,
    hotel: hotelId,
    booking: eligibleBooking._id,
    rating,
    comment: comment || '',
  });

  await recalculateHotelRating(hotel._id);

  return res.status(201).json(new ApiResponse(201, { review }, 'Review submitted.'));
});
