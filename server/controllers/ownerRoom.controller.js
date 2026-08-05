import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';

const toImageDocs = (imageUrls = []) =>
  imageUrls
    .filter((url) => url && url.trim())
    .map((url, index) => ({ url: url.trim(), publicId: `owner-room-${Date.now()}-${index}` }));

const getOwnedHotel = async (hotelId, ownerId) => {
  if (!mongoose.isValidObjectId(hotelId)) return null;
  return Hotel.findOne({ _id: hotelId, owner: ownerId });
};

// Loads a room and verifies, via its parent hotel, that it belongs to this
// owner — a room's `hotel` field can't be trusted from the URL alone.
const getOwnedRoom = async (roomId, ownerId) => {
  if (!mongoose.isValidObjectId(roomId)) return null;
  const room = await Room.findById(roomId);
  if (!room) return null;
  const hotel = await Hotel.findOne({ _id: room.hotel, owner: ownerId }).select('_id');
  return hotel ? room : null;
};

export const listRoomsForHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotel = await getOwnedHotel(hotelId, req.account._id);
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const rooms = await Room.find({ hotel: hotelId }).sort({ price: 1 }).lean();
  return res.status(200).json(new ApiResponse(200, { rooms }));
});

export const createRoom = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotel = await getOwnedHotel(hotelId, req.account._id);
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  const { type, price, capacity, totalRooms, amenities, imageUrls } = req.body;

  const room = await Room.create({
    hotel: hotelId,
    type,
    price,
    capacity,
    totalRooms,
    amenities: amenities || [],
    images: toImageDocs(imageUrls),
    isActive: true,
  });

  return res.status(201).json(new ApiResponse(201, { room }, 'Room added.'));
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await getOwnedRoom(req.params.id, req.account._id);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  const { type, price, capacity, totalRooms, amenities, imageUrls } = req.body;

  room.type = type;
  room.price = price;
  room.capacity = capacity;
  room.totalRooms = totalRooms;
  room.amenities = amenities || [];
  room.images = toImageDocs(imageUrls);

  await room.save();

  return res.status(200).json(new ApiResponse(200, { room }, 'Room updated.'));
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await getOwnedRoom(req.params.id, req.account._id);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  await room.deleteOne();

  return res.status(200).json(new ApiResponse(200, null, 'Room deleted.'));
});

export const toggleRoomActive = asyncHandler(async (req, res) => {
  const room = await getOwnedRoom(req.params.id, req.account._id);
  if (!room) {
    throw new ApiError(404, 'Room not found');
  }

  room.isActive = !room.isActive;
  await room.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { room }, `Room marked ${room.isActive ? 'active' : 'inactive'}.`));
});
