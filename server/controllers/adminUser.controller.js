import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.model.js';
import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';

const BOOKED_STATUSES = ['confirmed', 'completed'];

export const listUsers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const match = {};
  if (status) match.status = status;
  if (search) {
    const re = new RegExp(search, 'i');
    match.$or = [{ name: re }, { email: re }];
  }

  const [users, total] = await Promise.all([
    User.find(match)
      .select('-password -refreshTokenVersion')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(match),
  ]);

  const userIds = users.map((u) => u._id);
  const bookingStats = await Booking.aggregate([
    { $match: { user: { $in: userIds }, status: { $in: BOOKED_STATUSES } } },
    { $group: { _id: '$user', bookingCount: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
  ]);
  const statsByUser = new Map(bookingStats.map((s) => [String(s._id), s]));

  const enriched = users.map((u) => ({
    ...u,
    bookingCount: statsByUser.get(String(u._id))?.bookingCount || 0,
    totalSpent: statsByUser.get(String(u._id))?.totalSpent || 0,
  }));

  return res.status(200).json(
    new ApiResponse(200, {
      users: enriched,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    })
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'User not found');
  }

  const user = await User.findById(id).select('-password -refreshTokenVersion').lean();
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const [reviews, bookingStats] = await Promise.all([
    Review.find({ user: id }).populate('hotel', 'name').sort({ createdAt: -1 }).lean(),
    Booking.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(id), status: { $in: BOOKED_STATUSES } } },
      { $group: { _id: null, bookingCount: { $sum: 1 }, totalSpent: { $sum: '$totalPrice' } } },
    ]),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      user,
      reviews,
      bookingCount: bookingStats[0]?.bookingCount || 0,
      totalSpent: bookingStats[0]?.totalSpent || 0,
    })
  );
});

const setStatus = (status) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(404, 'User not found');
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select(
      '-password -refreshTokenVersion'
    );
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user }, `User ${status === 'suspended' ? 'suspended' : 'activated'}.`));
  });

export const suspendUser = setStatus('suspended');
export const activateUser = setStatus('active');

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'User not found');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'User deleted.'));
});
