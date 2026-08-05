import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.model.js';
import Owner from '../models/Owner.model.js';
import Hotel from '../models/Hotel.model.js';

const STATUSES = ['pending', 'approved', 'rejected'];

export const getSummary = asyncHandler(async (req, res) => {
  const [totalUsers, totalOwners, statusCounts] = await Promise.all([
    User.countDocuments(),
    Owner.countDocuments(),
    Hotel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const hotels = STATUSES.reduce((acc, status) => ({ ...acc, [status]: 0 }), { total: 0 });
  for (const { _id, count } of statusCounts) {
    hotels[_id] = count;
    hotels.total += count;
  }

  return res.status(200).json(
    new ApiResponse(200, {
      totalUsers,
      totalOwners,
      hotels,
    })
  );
});
