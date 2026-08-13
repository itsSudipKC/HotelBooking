import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import Review from '../models/Review.model.js';
import { sendNewHotelSubmissionEmail } from '../services/email.service.js';

const toImageDocs = (imageUrls = []) =>
  imageUrls
    .filter((url) => url && url.trim())
    .map((url, index) => ({ url: url.trim(), publicId: `owner-${Date.now()}-${index}` }));

export const listMyHotels = asyncHandler(async (req, res) => {
  const hotels = await Hotel.find({ owner: req.account._id }).sort({ createdAt: -1 }).lean();

  const hotelIds = hotels.map((h) => h._id);
  const roomCounts = await Room.aggregate([
    { $match: { hotel: { $in: hotelIds } } },
    { $group: { _id: '$hotel', count: { $sum: 1 } } },
  ]);
  const countsByHotel = new Map(roomCounts.map((c) => [String(c._id), c.count]));

  const enriched = hotels.map((h) => ({ ...h, roomCount: countsByHotel.get(String(h._id)) || 0 }));

  return res.status(200).json(new ApiResponse(200, { hotels: enriched }));
});

export const getMyHotelById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: id, owner: req.account._id }).lean();
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const [rooms, reviews] = await Promise.all([
    Room.find({ hotel: id }).sort({ price: 1 }).lean(),
    Review.find({ hotel: id }).populate('user', 'name avatar').sort({ createdAt: -1 }).lean(),
  ]);

  return res.status(200).json(new ApiResponse(200, { hotel, rooms, reviews }));
});

export const createHotel = asyncHandler(async (req, res) => {
  const { name, description, category, starRating, street, city, country, lat, lng, amenities, imageUrls } =
    req.body;

  const hotel = await Hotel.create({
    owner: req.account._id,
    name,
    description,
    category: category || '',
    starRating: starRating || 1,
    address: { street: street || '', city, country },
    location: { lat: lat || undefined, lng: lng || undefined },
    amenities: amenities || [],
    images: toImageDocs(imageUrls),
    status: 'pending',
  });

  await sendNewHotelSubmissionEmail({ ownerName: req.account.name, hotelName: hotel.name, isResubmission: false });

  return res.status(201).json(new ApiResponse(201, { hotel }, 'Hotel submitted for admin review.'));
});

export const updateHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: id, owner: req.account._id });
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const { name, description, category, starRating, street, city, country, lat, lng, amenities, imageUrls } =
    req.body;

  hotel.name = name;
  hotel.description = description;
  hotel.category = category || '';
  hotel.starRating = starRating || hotel.starRating;
  hotel.address = { street: street || '', city, country };
  hotel.location = { lat: lat || undefined, lng: lng || undefined };
  hotel.amenities = amenities || [];
  hotel.images = toImageDocs(imageUrls);

  const wasReviewed = hotel.status === 'approved' || hotel.status === 'rejected';
  if (wasReviewed) {
    hotel.status = 'pending';
    hotel.rejectionReason = '';
  }

  await hotel.save();

  if (wasReviewed) {
    await sendNewHotelSubmissionEmail({ ownerName: req.account.name, hotelName: hotel.name, isResubmission: true });
  }

  return res.status(200).json(new ApiResponse(200, { hotel }, 'Hotel updated.'));
});

// Deliberately separate from updateHotel: that action resets an
// approved/rejected hotel back to 'pending' on any edit (see wasReviewed
// above). FAQ text is chatbot-only informational content, not core listing
// content, so it shouldn't force a live listing back into review limbo.
export const updateHotelFaqs = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: id, owner: req.account._id });
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  hotel.faqs = req.body.faqs.map(({ question, answer }) => ({ question, answer }));
  await hotel.save();

  return res.status(200).json(new ApiResponse(200, { hotel }, 'FAQs updated.'));
});

export const deleteHotel = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Hotel not found');
  }

  const hotel = await Hotel.findOne({ _id: id, owner: req.account._id });
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  await Promise.all([Room.deleteMany({ hotel: id }), Review.deleteMany({ hotel: id })]);
  await hotel.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'Hotel deleted.'));
});
