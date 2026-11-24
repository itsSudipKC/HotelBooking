import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import Wishlist from '../models/Wishlist.model.js';
import Owner from '../models/Owner.model.js';

// Content-based, weighted match score. Computed on-demand — the catalog is
// small enough (tens of hotels) that this needs no batch job or vector
// store, same philosophy as getSimilarHotels' plain in-request queries.
const RATING_DAMPING_COUNT = 3;
const WEIGHTS = { rating: 0.3, budget: 0.2, amenities: 0.2, location: 0.15, roomType: 0.15 };

export const getRecommendedHotels = async (userId, limit = 8) => {
  const [approvedHotels, userBookings, wishlist, topRatedByUser] = await Promise.all([
    Hotel.find({ status: 'approved' }).populate('owner', 'name avatar').lean(),
    Booking.find({ user: userId, status: { $in: ['pending', 'confirmed', 'completed'] } })
      .populate('hotel', 'address amenities')
      .populate('room', 'type')
      .lean(),
    Wishlist.findOne({ user: userId }).populate('hotels', 'address amenities').lean(),
    Review.find({ user: userId, rating: { $gte: 3 } }).populate('hotel', 'address amenities').lean(),
  ]);

  if (!approvedHotels.length) return [];

  const globalAvgRating =
    approvedHotels.reduce((sum, h) => sum + (h.avgRating || 0), 0) / approvedHotels.length || 0;

  const hotelIds = approvedHotels.map((h) => h._id);
  const rooms = await Room.find({ hotel: { $in: hotelIds }, isActive: true }).select('hotel type price').lean();
  const roomsByHotel = new Map();
  for (const room of rooms) {
    const key = String(room.hotel);
    if (!roomsByHotel.has(key)) roomsByHotel.set(key, []);
    roomsByHotel.get(key).push(room);
  }

  const historyHotels = [
    ...userBookings.map((b) => b.hotel).filter(Boolean),
    ...(wishlist?.hotels || []),
    ...topRatedByUser.map((r) => r.hotel).filter(Boolean),
  ];
  const preferredAmenities = new Set(historyHotels.flatMap((h) => h.amenities || []));
  const preferredCities = new Set(historyHotels.map((h) => h.address?.city).filter(Boolean));
  const preferredCountries = new Set(historyHotels.map((h) => h.address?.country).filter(Boolean));
  const bookedRoomTypes = new Set(userBookings.map((b) => b.room?.type?.toLowerCase()).filter(Boolean));

  let userBudget = null;
  const nightlyRates = userBookings.map((b) => b.roomPrice / (b.nights || 1)).filter(Number.isFinite);
  if (nightlyRates.length) {
    userBudget = nightlyRates.reduce((a, b) => a + b, 0) / nightlyRates.length;
  } else if (wishlist?.hotels?.length) {
    const wishlistPrices = wishlist.hotels
      .map((h) => {
        const hRooms = roomsByHotel.get(String(h._id)) || [];
        return hRooms.length ? Math.min(...hRooms.map((r) => r.price)) : null;
      })
      .filter((p) => p != null);
    if (wishlistPrices.length) userBudget = wishlistPrices.reduce((a, b) => a + b, 0) / wishlistPrices.length;
  }

  const scored = approvedHotels
    .map((hotel) => {
      const hRooms = roomsByHotel.get(String(hotel._id)) || [];
      const startingPrice = hRooms.length ? Math.min(...hRooms.map((r) => r.price)) : null;

      // Each component is included only when there's real signal for it —
      // a component with no signal is dropped and its weight redistributed
      // across the rest below. This IS the cold-start handling: a brand
      // new user has signal only for "rating", so ranking collapses to the
      // same Bayesian-rating ordering getFeaturedHotels already used.
      const components = [];

      const damped =
        ((hotel.avgRating || 0) * (hotel.reviewCount || 0) + globalAvgRating * RATING_DAMPING_COUNT) /
        ((hotel.reviewCount || 0) + RATING_DAMPING_COUNT);
      components.push({ weight: WEIGHTS.rating, score: Math.max(0, Math.min(1, damped / 5)) });

      if (userBudget != null && startingPrice != null) {
        const diffRatio = Math.abs(startingPrice - userBudget) / userBudget;
        components.push({ weight: WEIGHTS.budget, score: Math.max(0, 1 - Math.min(1, diffRatio)) });
      }

      if (preferredAmenities.size && hotel.amenities?.length) {
        const hotelSet = new Set(hotel.amenities);
        const intersection = [...hotelSet].filter((a) => preferredAmenities.has(a)).length;
        const union = new Set([...hotelSet, ...preferredAmenities]).size;
        if (union > 0) components.push({ weight: WEIGHTS.amenities, score: intersection / union });
      }

      if (preferredCities.size) {
        let score = 0;
        if (preferredCities.has(hotel.address?.city)) score = 1;
        else if (preferredCountries.has(hotel.address?.country)) score = 0.3;
        components.push({ weight: WEIGHTS.location, score });
      }

      if (bookedRoomTypes.size && hRooms.length) {
        const hasMatch = hRooms.some((r) => bookedRoomTypes.has(r.type?.toLowerCase()));
        components.push({ weight: WEIGHTS.roomType, score: hasMatch ? 1 : 0 });
      }

      const totalWeight = components.reduce((sum, c) => sum + c.weight, 0);
      const matchScore = totalWeight > 0 ? components.reduce((sum, c) => sum + c.weight * c.score, 0) / totalWeight : 0;

      return { ...hotel, startingPrice, matchScore: Math.round(matchScore * 100) / 100 };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return scored;
};
