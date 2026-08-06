import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Wishlist from '../models/Wishlist.model.js';

const HOTEL_CARD_FIELDS = 'name images address avgRating reviewCount starRating status';

export const toggleWishlist = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!mongoose.isValidObjectId(hotelId)) {
    throw new ApiError(404, 'Hotel not found');
  }

  let wishlist = await Wishlist.findOne({ user: req.account._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.account._id, hotels: [] });
  }

  const alreadySaved = wishlist.hotels.some((id) => String(id) === hotelId);

  if (alreadySaved) {
    wishlist.hotels = wishlist.hotels.filter((id) => String(id) !== hotelId);
  } else {
    wishlist.hotels.push(hotelId);
  }
  await wishlist.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { wishlisted: !alreadySaved }, alreadySaved ? 'Removed from wishlist.' : 'Added to wishlist.'));
});

export const getWishlistStatus = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  if (!mongoose.isValidObjectId(hotelId)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const wishlist = await Wishlist.findOne({ user: req.account._id, hotels: hotelId });
  return res.status(200).json(new ApiResponse(200, { wishlisted: !!wishlist }));
});

export const listMyWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.account._id }).populate({
    path: 'hotels',
    select: HOTEL_CARD_FIELDS,
    match: { status: 'approved' },
  });

  return res.status(200).json(new ApiResponse(200, { hotels: wishlist?.hotels || [] }));
});
