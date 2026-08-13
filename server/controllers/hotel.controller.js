import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import { getRecommendedHotels } from '../services/recommendation.service.js';
import { answerQuestion } from '../services/hotelChatbot.service.js';

const PUBLIC_OWNER_FIELDS = 'name avatar';

const SORT_STAGES = {
  price_asc: { startingPrice: 1 },
  price_desc: { startingPrice: -1 },
  rating: { avgRating: -1 },
  newest: { createdAt: -1 },
};

export const listHotels = asyncHandler(async (req, res) => {
  const { search, city, country, minPrice, maxPrice, rating, amenities, sort = 'newest' } = req.query;

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 9));

  const match = { status: 'approved' };
  if (search) match.$text = { $search: search };
  if (city) match['address.city'] = new RegExp(`^${city}$`, 'i');
  if (country) match['address.country'] = new RegExp(`^${country}$`, 'i');
  if (rating) match.avgRating = { $gte: Number(rating) };
  if (amenities) {
    const list = amenities
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);
    if (list.length) match.amenities = { $all: list };
  }

  const priceMatch = {};
  if (minPrice) priceMatch.$gte = Number(minPrice);
  if (maxPrice) priceMatch.$lte = Number(maxPrice);

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'rooms',
        let: { hotelId: '$_id' },
        pipeline: [
          { $match: { $expr: { $and: [{ $eq: ['$hotel', '$$hotelId'] }, { $eq: ['$isActive', true] }] } } },
          { $project: { price: 1 } },
        ],
        as: 'rooms',
      },
    },
    { $addFields: { startingPrice: { $min: '$rooms.price' } } },
  ];

  if (Object.keys(priceMatch).length) {
    pipeline.push({ $match: { startingPrice: priceMatch } });
  }

  pipeline.push(
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
              pipeline: [{ $project: { name: 1, avatar: 1 } }],
            },
          },
          { $unwind: { path: '$owner', preserveNullAndEmptyArrays: true } },
          { $project: { rooms: 0, rejectionReason: 0 } },
        ],
        totalCount: [{ $count: 'count' }],
      },
    }
  );

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

export const getFeaturedHotels = asyncHandler(async (req, res) => {
  const limit = Math.min(12, Math.max(1, parseInt(req.query.limit, 10) || 8));

  const hotels = await Hotel.find({ status: 'approved' })
    .sort({ avgRating: -1, viewCount: -1 })
    .limit(limit)
    .populate('owner', PUBLIC_OWNER_FIELDS)
    .lean();

  return res.status(200).json(new ApiResponse(200, { hotels }));
});

export const getHotelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOneAndUpdate(
    { _id: id, status: 'approved' },
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('owner', PUBLIC_OWNER_FIELDS)
    .lean();

  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const rooms = await Room.find({ hotel: id, isActive: true }).sort({ price: 1 }).lean();

  return res.status(200).json(new ApiResponse(200, { hotel, rooms }));
});

export const getRecommendedForMe = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit, 10) || 8));
  const hotels = await getRecommendedHotels(req.account._id, limit);
  return res.status(200).json(new ApiResponse(200, { hotels }));
});

export const chatWithHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: id, status: 'approved' }).populate('owner', 'phone').lean();
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const rooms = await Room.find({ hotel: id, isActive: true }).select('type price capacity').lean();

  const { answer, matched } = answerQuestion({ hotel, rooms, question: req.body.question });
  return res.status(200).json(new ApiResponse(200, { answer, matched }));
});

export const getSimilarHotels = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findById(id).select('address.city amenities').lean();
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const orClauses = [{ 'address.city': hotel.address.city }];
  if (hotel.amenities?.length) {
    orClauses.push({ amenities: { $in: hotel.amenities } });
  }

  const hotels = await Hotel.find({
    _id: { $ne: id },
    status: 'approved',
    $or: orClauses,
  })
    .sort({ avgRating: -1 })
    .limit(4)
    .populate('owner', PUBLIC_OWNER_FIELDS)
    .lean();

  return res.status(200).json(new ApiResponse(200, { hotels }));
});
