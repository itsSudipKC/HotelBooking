import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Booking from '../models/Booking.model.js';
import Room from '../models/Room.model.js';
import Hotel from '../models/Hotel.model.js';
import { sendBookingConfirmedEmail, sendBookingRejectedEmail } from '../services/email.service.js';

// Loads a booking and verifies, via its hotel, that it belongs to this
// owner — same pattern as ownerRoom.controller.js's getOwnedRoom.
const getOwnedBooking = async (bookingId, ownerId) => {
  if (!mongoose.isValidObjectId(bookingId)) return null;
  const booking = await Booking.findById(bookingId).populate('hotel', 'owner name');
  if (!booking) return null;
  if (String(booking.hotel.owner) !== String(ownerId)) return null;
  return booking;
};

export const listBookingsForOwner = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const ownedHotelIds = await Hotel.find({ owner: req.account._id }).distinct('_id');
  const match = { hotel: { $in: ownedHotelIds } };
  if (status) match.status = status;

  const bookings = await Booking.find(match)
    .populate('user', 'name email phone')
    .populate('hotel', 'name')
    .populate('room', 'type')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, { bookings }));
});

export const getOwnerBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('hotel', 'name owner')
    .populate('room', 'type price capacity')
    .lean();

  if (!booking || String(booking.hotel.owner) !== String(req.account._id)) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, { booking }));
});

export const acceptBooking = asyncHandler(async (req, res) => {
  const booking = await getOwnedBooking(req.params.id, req.account._id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  if (booking.status !== 'pending') {
    throw new ApiError(400, `Only pending bookings can be accepted (this one is ${booking.status})`);
  }

  const room = await Room.findById(booking.room);
  const overlaps = await Booking.countDocuments({
    room: booking.room,
    status: 'confirmed',
    checkIn: { $lt: booking.checkOut },
    checkOut: { $gt: booking.checkIn },
  });
  if (overlaps >= room.totalRooms) {
    throw new ApiError(409, 'the room is not available for this time you can try to book another room or another date');
  }

  booking.status = 'confirmed';
  await booking.save();
  await Room.updateOne(
    { _id: booking.room },
    { $push: { bookedDates: { checkIn: booking.checkIn, checkOut: booking.checkOut, booking: booking._id } } }
  );

  const guest = await booking.populate('user', 'name email');
  await sendBookingConfirmedEmail({
    to: guest.user.email,
    guestName: guest.user.name,
    hotelName: booking.hotel.name,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
  });

  return res.status(200).json(new ApiResponse(200, { booking }, 'Booking accepted.'));
});

export const rejectBooking = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const booking = await getOwnedBooking(req.params.id, req.account._id);
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  if (booking.status !== 'pending') {
    throw new ApiError(400, `Only pending bookings can be rejected (this one is ${booking.status})`);
  }

  booking.status = 'rejected';
  booking.cancellationReason = reason;
  await booking.save();

  const guest = await booking.populate('user', 'name email');
  await sendBookingRejectedEmail({ to: guest.user.email, guestName: guest.user.name, hotelName: booking.hotel.name, reason });

  return res.status(200).json(new ApiResponse(200, { booking }, 'Booking rejected.'));
});
