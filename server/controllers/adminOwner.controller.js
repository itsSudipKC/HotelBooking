import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Owner from '../models/Owner.model.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import { sendOwnerCreatedEmail } from '../services/email.service.js';

const SALT_ROUNDS = 12;

export const listOwners = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const match = {};
  if (status) match.status = status;
  if (search) {
    const re = new RegExp(search, 'i');
    match.$or = [{ name: re }, { email: re }, { businessName: re }];
  }

  const [owners, total] = await Promise.all([
    Owner.find(match)
      .select('-password -refreshTokenVersion')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Owner.countDocuments(match),
  ]);

  const ownerIds = owners.map((o) => o._id);
  const hotelCounts = await Hotel.aggregate([
    { $match: { owner: { $in: ownerIds } } },
    { $group: { _id: '$owner', count: { $sum: 1 } } },
  ]);
  const countsByOwner = new Map(hotelCounts.map((c) => [String(c._id), c.count]));

  const enriched = owners.map((o) => ({ ...o, hotelCount: countsByOwner.get(String(o._id)) || 0 }));

  return res.status(200).json(
    new ApiResponse(200, {
      owners: enriched,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    })
  );
});

export const getOwnerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Owner not found');
  }

  const owner = await Owner.findById(id).select('-password -refreshTokenVersion').lean();
  if (!owner) {
    throw new ApiError(404, 'Owner not found');
  }

  const hotels = await Hotel.find({ owner: id }).sort({ createdAt: -1 }).lean();
  const hotelIds = hotels.map((h) => h._id);

  const [roomStats] = await Room.aggregate([
    { $match: { hotel: { $in: hotelIds } } },
    { $group: { _id: null, totalRooms: { $sum: '$totalRooms' } } },
  ]);

  const totalReviews = hotels.reduce((sum, h) => sum + (h.reviewCount || 0), 0);
  const avgRating = hotels.length
    ? Math.round((hotels.reduce((sum, h) => sum + (h.avgRating || 0), 0) / hotels.length) * 10) / 10
    : 0;

  return res.status(200).json(
    new ApiResponse(200, {
      owner,
      hotels,
      stats: {
        hotelCount: hotels.length,
        totalRooms: roomStats?.totalRooms || 0,
        totalReviews,
        avgRating,
      },
    })
  );
});

export const createOwner = asyncHandler(async (req, res) => {
  const { name, email, phone, businessName } = req.body;

  const existing = await Owner.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An owner with that email already exists');
  }

  const tempPassword = crypto.randomBytes(6).toString('hex');
  const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

  const owner = await Owner.create({
    name,
    email,
    phone,
    businessName: businessName || '',
    password: hashedPassword,
    isEmailVerified: true,
  });

  await sendOwnerCreatedEmail({ to: owner.email, name: owner.name, tempPassword });

  const sanitized = owner.toObject();
  delete sanitized.password;
  delete sanitized.refreshTokenVersion;

  return res.status(201).json(new ApiResponse(201, { owner: sanitized }, 'Owner account created.'));
});

const setStatus = (status) =>
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(404, 'Owner not found');
    }

    const owner = await Owner.findByIdAndUpdate(id, { status }, { new: true }).select(
      '-password -refreshTokenVersion'
    );
    if (!owner) {
      throw new ApiError(404, 'Owner not found');
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { owner }, `Owner ${status === 'suspended' ? 'suspended' : 'activated'}.`));
  });

export const suspendOwner = setStatus('suspended');
export const activateOwner = setStatus('active');

export const deleteOwner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Owner not found');
  }

  const hotelCount = await Hotel.countDocuments({ owner: id });
  if (hotelCount > 0) {
    throw new ApiError(400, 'Cannot delete an owner with existing hotels — reassign or remove their hotels first.');
  }

  const owner = await Owner.findByIdAndDelete(id);
  if (!owner) {
    throw new ApiError(404, 'Owner not found');
  }

  return res.status(200).json(new ApiResponse(200, null, 'Owner deleted.'));
});
