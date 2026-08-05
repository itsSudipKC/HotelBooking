import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import Review from '../models/Review.model.js';
import { sendHotelApprovedEmail, sendHotelRejectedEmail } from '../services/email.service.js';

const ADMIN_OWNER_FIELDS = 'name email phone avatar';

const SORT_STAGES = {
  price_asc: { startingPrice: 1 },
  price_desc: { startingPrice: -1 },
  rating: { avgRating: -1 },
  newest: { createdAt: -1 },
};

export const listHotels = asyncHandler(async (req, res) => {
  const { search, city, status, sort = 'newest' } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const match = {};
  if (status) match.status = status;
  if (search) match.$text = { $search: search };
  if (city) match['address.city'] = new RegExp(`^${city}$`, 'i');

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'rooms',
        let: { hotelId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$hotel', '$$hotelId'] } } },
          { $project: { price: 1 } },
        ],
        as: 'rooms',
      },
    },
    { $addFields: { startingPrice: { $min: '$rooms.price' }, roomCount: { $size: '$rooms' } } },
    { $sort: SORT_STAGES[sort] || SORT_STAGES.newest },
    {
      $facet: {
        data: [
          { $skip: (page - 1) * limit },
          { $limit: limit },
          {
            $lookup: {
              from: 'owners',
              localField: 'owner',
              foreignField: '_id',
              as: 'owner',
              pipeline: [{ $project: { name: 1, email: 1, phone: 1, avatar: 1 } }],
            },
          },
          { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
          { $project: { rooms: 0 } },
        ],
        totalCount: [{ $count: 'count' }],
      },
    },
  ];

  const [result] = await Hotel.aggregate(pipeline);
  const hotels = result?.data || [];
  const total = result?.totalCount?.[0]?.count || 0;

  return res.status(200).json(
    new ApiResponse(200, {
      hotels,
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    })
  );
});

export const getHotelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findById(id).populate('owner', ADMIN_OWNER_FIELDS).lean();
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const rooms = await Room.find({ hotel: id }).sort({ price: 1 }).lean();

  return res.status(200).json(new ApiResponse(200, { hotel, rooms }));
});

export const approveHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findByIdAndUpdate(
    id,
    { status: 'approved', rejectionReason: '' },
    { new: true }
  ).populate('owner', ADMIN_OWNER_FIELDS);

  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  if (hotel.owner?.email) {
    await sendHotelApprovedEmail({ to: hotel.owner.email, ownerName: hotel.owner.name, hotelName: hotel.name });
  }

  return res.status(200).json(new ApiResponse(200, { hotel }, 'Hotel approved.'));
});

export const rejectHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findByIdAndUpdate(
    id,
    { status: 'rejected', rejectionReason: reason },
    { new: true }
  ).populate('owner', ADMIN_OWNER_FIELDS);

  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  if (hotel.owner?.email) {
    await sendHotelRejectedEmail({
      to: hotel.owner.email,
      ownerName: hotel.owner.name,
      hotelName: hotel.name,
      reason,
    });
  }

  return res.status(200).json(new ApiResponse(200, { hotel }, 'Hotel rejected.'));
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findById(id);
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  await Promise.all([Room.deleteMany({ hotel: id }), Review.deleteMany({ hotel: id })]);
  await hotel.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'Hotel deleted.'));
});
