import Booking from '../models/Booking.model.js';

// Booking.status has always had 'completed' in its enum, but nothing ever set
// it — there's no cron/scheduler in this app. This lazily materializes it:
// any 'confirmed' booking whose stay has already ended is swept to
// 'completed' whenever a user's bookings are read.
export const sweepCompletedBookings = (filter = {}) =>
  Booking.updateMany({ ...filter, status: 'confirmed', checkOut: { $lt: new Date() } }, { status: 'completed' });

// Review-eligibility gate. Computed directly (not dependent on the sweep
// above having run yet) so review-writing works even if the guest never
// revisited "My Bookings" after checkout.
export const findEligibleBooking = (userId, hotelId) =>
  Booking.findOne({
    user: userId,
    hotel: hotelId,
    $or: [{ status: 'completed' }, { status: 'confirmed', checkOut: { $lt: new Date() } }],
  });
