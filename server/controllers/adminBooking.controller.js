import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Booking from '../models/Booking.model.js';

export const listBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const match = {};
  if (status) match.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(match)
      .populate('user', 'name email')
      .populate('hotel', 'name')
      .populate('room', 'type')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Booking.countDocuments(match),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    })
  );
});

export const getBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Booking not found');
  }

  const booking = await Booking.findById(id)
    .populate('user', 'name email phone')
    .populate({ path: 'hotel', select: 'name address owner', populate: { path: 'owner', select: 'name email' } })
    .populate('room', 'type price capacity')
    .populate('payment')
    .lean();

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, { booking }));
});
