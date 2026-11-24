// import asyncHandler from '../utils/asyncHandler.js';
// import ApiResponse from '../utils/ApiResponse.js';
// import Hotel from '../models/Hotel.model.js';
// import Room from '../models/Room.model.js';

// const STATUSES = ['pending', 'approved', 'rejected'];

// export const getSummary = asyncHandler(async (req, res) => {
//   const ownerId = req.account._id;

//   const statusCounts = await Hotel.aggregate([
//     { $match: { owner: ownerId } },
//     { $group: { _id: '$status', count: { $sum: 1 } } },
//   ]);

//   const hotels = STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), { total: 0 });
//   for (const { _id, count } of statusCounts) {
//     hotels[_id] = count;
//     hotels.total += count;
//   }

//   const hotelIds = await Hotel.find({ owner: ownerId }).distinct('_id');
//   const [roomStats] = await Room.aggregate([
//     { $match: { hotel: { $in: hotelIds } } },
//     { $group: { _id: null, totalRooms: { $sum: '$totalRooms' } } },
//   ]);

//   return res.status(200).json(
//     new ApiResponse(200, {
//       hotels,
//       totalRooms: roomStats?.totalRooms || 0,
//     })
//   );
// });


import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import Booking from '../models/Booking.model.js';

const STATUSES = ['pending', 'approved', 'rejected'];

export const getSummary = asyncHandler(async (req, res) => {
  const ownerId = req.account._id;

  const statusCounts = await Hotel.aggregate([
    { $match: { owner: ownerId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const hotels = STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), { total: 0 });
  for (const { _id, count } of statusCounts) {
    hotels[_id] = count;
    hotels.total += count;
  }

  const hotelIds = await Hotel.find({ owner: ownerId }).distinct('_id');
  const [roomStats] = await Room.aggregate([
    { $match: { hotel: { $in: hotelIds } } },
    { $group: { _id: null, totalRooms: { $sum: '$totalRooms' } } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      hotels,
      totalRooms: roomStats?.totalRooms || 0,
    })
  );
});

// Earnings recognition rule:
// - cancelled/rejected bookings never count
// - a booking with a successful online payment (booking.payment is set,
//   since the payment callbacks only attach it on success) counts
//   immediately, recognized on the payment's verifiedAt date
// - a booking with no successful online payment (cash / pay-at-hotel,
//   or a failed/abandoned online payment) counts only once its
//   checkOut date has passed, recognized on that checkOut date
export const getEarnings = asyncHandler(async (req, res) => {
  const ownerId = req.account._id;

  const hotelIds = await Hotel.find({ owner: ownerId }).distinct('_id');

  if (hotelIds.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, { totalEarnings: 0, monthEarnings: 0, transactions: [] })
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const bookings = await Booking.find({
    hotel: { $in: hotelIds },
    status: { $nin: ['cancelled', 'rejected'] },
  })
    .populate('user', 'name email')
    .populate('hotel', 'name')
    .populate('payment', 'method status verifiedAt')
    .select('totalPrice status payment checkOut createdAt user hotel')
    .lean();

  const earned = [];
  for (const booking of bookings) {
    const paidOnline = booking.payment && booking.payment.status === 'success';
    const checkedOut = new Date(booking.checkOut) <= now;

    if (!paidOnline && !checkedOut) continue; // not recognized yet

    const recognizedAt = paidOnline ? booking.payment.verifiedAt || booking.createdAt : booking.checkOut;
    earned.push({ ...booking, recognizedAt });
  }

  earned.sort((a, b) => new Date(b.recognizedAt) - new Date(a.recognizedAt));

  const totalEarnings = earned.reduce((sum, b) => sum + b.totalPrice, 0);
  const monthEarnings = earned
    .filter((b) => new Date(b.recognizedAt) >= startOfMonth)
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const transactions = earned.slice(0, 8);

  return res.status(200).json(
    new ApiResponse(200, {
      totalEarnings,
      monthEarnings,
      transactions,
    })
  );
});