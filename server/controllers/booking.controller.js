import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Booking from '../models/Booking.model.js';
import Room from '../models/Room.model.js';
import Hotel from '../models/Hotel.model.js';
import Owner from '../models/Owner.model.js';
import { sendBookingRequestEmail } from '../services/email.service.js';

const TAX_RATE = 0.13; // Nepal VAT

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const countConfirmedOverlaps = (roomId, checkIn, checkOut) =>
  Booking.countDocuments({
    room: roomId,
    status: 'confirmed',
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, guests } = req.body;
  const checkIn = new Date(req.body.checkIn);
  const checkOut = new Date(req.body.checkOut);

  if (!mongoose.isValidObjectId(roomId)) {
    throw new ApiError(404, 'Room not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) {
    throw new ApiError(400, 'Check-in date cannot be in the past');
  }
  if (checkOut <= checkIn) {
    throw new ApiError(400, 'Check-out date must be after check-in date');
  }

  const room = await Room.findOne({ _id: roomId, isActive: true });
  if (!room) {
    throw new ApiError(404, 'Room not found or no longer available');
  }

  const hotel = await Hotel.findOne({ _id: room.hotel, status: 'approved' });
  if (!hotel) {
    throw new ApiError(404, 'Hotel not found');
  }

  if (guests > room.capacity) {
    throw new ApiError(400, `This room fits up to ${room.capacity} guests`);
  }

  const overlaps = await countConfirmedOverlaps(room._id, checkIn, checkOut);
  if (overlaps >= room.totalRooms) {
    throw new ApiError(400, 'This room is fully booked for the selected dates');
  }

  const nights = Math.round((checkOut - checkIn) / MS_PER_DAY);
  const roomPrice = room.price * nights;
  const taxes = Math.round(roomPrice * TAX_RATE);
  const totalPrice = roomPrice + taxes;

  const booking = await Booking.create({
    user: req.account._id,
    hotel: hotel._id,
    room: room._id,
    checkIn,
    checkOut,
    nights,
    guests,
    roomPrice,
    taxes,
    totalPrice,
    status: 'pending',
    invoiceNumber: `BK-${Date.now()}`,
  });

  const owner = await Owner.findById(hotel.owner).select('email name');
  if (owner?.email) {
    await sendBookingRequestEmail({
      to: owner.email,
      ownerName: owner.name,
      hotelName: hotel.name,
      guestName: req.account.name,
      checkIn,
      checkOut,
    });
  }

  return res.status(201).json(new ApiResponse(201, { booking }, 'Booking request submitted.'));
});

export const listMyBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const match = { user: req.account._id };
  if (status) match.status = status;

  const bookings = await Booking.find(match)
    .populate('hotel', 'name images address')
    .populate('room', 'type')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(new ApiResponse(200, { bookings }));
});

export const getMyBookingById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Booking not found');
  }

  const booking = await Booking.findOne({ _id: id, user: req.account._id })
    .populate('hotel', 'name images address')
    .populate('room', 'type price capacity')
    .lean();

  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  return res.status(200).json(new ApiResponse(200, { booking }));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(404, 'Booking not found');
  }

  const booking = await Booking.findOne({ _id: id, user: req.account._id });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new ApiError(400, 'Only pending or confirmed bookings can be cancelled');
  }
  if (new Date(booking.checkIn) < new Date()) {
    throw new ApiError(400, 'This booking has already started and cannot be cancelled');
  }

  if (booking.status === 'confirmed') {
    await Room.updateOne({ _id: booking.room }, { $pull: { bookedDates: { booking: booking._id } } });
  }

  booking.status = 'cancelled';
  booking.cancellationReason = req.body.reason || '';
  await booking.save();

  return res.status(200).json(new ApiResponse(200, { booking }, 'Booking cancelled.'));
});
