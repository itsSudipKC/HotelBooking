import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';

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
