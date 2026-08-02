import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Owner from '../models/Owner.model.js';
import User from '../models/User.model.js';
import Hotel from '../models/Hotel.model.js';
import Room from '../models/Room.model.js';
import Review from '../models/Review.model.js';

// Populates demo hotels/rooms/reviews so the public pages have something to
// show before the real Owner "Add Hotel" flow exists (that's a later
// module). Safe to re-run: everything it creates is tagged with a fixed
// "@seed.demo" email domain and is deleted before being recreated, so it can
// never touch real accounts.

const SALT_ROUNDS = 12;
const SEED_DOMAIN = '@seed.demo';
const SEED_PASSWORD = 'Demo@1234';

const OWNERS = [
  { name: 'Aarav Sharma', email: `aarav${SEED_DOMAIN}` },
  { name: 'Priya Gurung', email: `priya${SEED_DOMAIN}` },
];

const REVIEWERS = [
  { name: 'Sita Rai', email: `sita${SEED_DOMAIN}` },
  { name: 'Bibek Thapa', email: `bibek${SEED_DOMAIN}` },
  { name: 'Anjali Koirala', email: `anjali${SEED_DOMAIN}` },
  { name: 'Rohan Basnet', email: `rohan${SEED_DOMAIN}` },
  { name: 'Mina Shrestha', email: `mina${SEED_DOMAIN}` },
];

const AMENITY_POOL = [
  'WiFi',
  'Parking',
  'Swimming Pool',
  'Restaurant',
  'Gym',
  'Room Service',
  'Spa',
  'Air Conditioning',
];

const HOTELS = [
  { name: 'Kathmandu Grand Palace', city: 'Kathmandu', country: 'Nepal', starRating: 5 },
  { name: 'Pokhara Lakeside Retreat', city: 'Pokhara', country: 'Nepal', starRating: 4 },
  { name: 'Everest View Lodge', city: 'Kathmandu', country: 'Nepal', starRating: 3 },
  { name: 'Chitwan Jungle Resort', city: 'Chitwan', country: 'Nepal', starRating: 4 },
  { name: 'Thamel Boutique Hotel', city: 'Kathmandu', country: 'Nepal', starRating: 3 },
  { name: 'Phewa Lake Inn', city: 'Pokhara', country: 'Nepal', starRating: 3 },
  { name: 'Sauraha Wildlife Camp', city: 'Chitwan', country: 'Nepal', starRating: 4 },
  { name: 'Bhaktapur Heritage Stay', city: 'Bhaktapur', country: 'Nepal', starRating: 4 },
  { name: 'Annapurna Hill Resort', city: 'Pokhara', country: 'Nepal', starRating: 5 },
  { name: 'Durbar Square Suites', city: 'Bhaktapur', country: 'Nepal', starRating: 3 },
];

const ROOM_TYPES = [
  { type: 'Single Room', price: 2000, capacity: 1 },
  { type: 'Double Room', price: 3500, capacity: 2 },
  { type: 'Deluxe Room', price: 5500, capacity: 3 },
  { type: 'Suite', price: 9000, capacity: 4 },
];

const REVIEW_COMMENTS = [
  'Great location and very friendly staff. Would stay again!',
  'Clean rooms and comfortable beds. Breakfast could be better.',
  'Amazing view and excellent service throughout our stay.',
  'Good value for money, close to everything we wanted to see.',
  'The pool and spa were fantastic. Highly recommended.',
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const pickImage = (seed, index) => ({
  url: `https://picsum.photos/seed/${seed}-${index}/1200/800`,
  publicId: `seed-${seed}-${index}`,
});

const randomAmenities = (count = 3 + Math.floor(Math.random() * 3)) => {
  const shuffled = [...AMENITY_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const seed = async () => {
  await connectDB();

  const ownerEmails = OWNERS.map((o) => o.email);
  const reviewerEmails = REVIEWERS.map((r) => r.email);

  const existingOwners = await Owner.find({ email: { $in: ownerEmails } }).select('_id');
  const existingOwnerIds = existingOwners.map((o) => o._id);
  const existingHotels = await Hotel.find({ owner: { $in: existingOwnerIds } }).select('_id');
  const existingHotelIds = existingHotels.map((h) => h._id);

  await Review.deleteMany({ hotel: { $in: existingHotelIds } });
  await Room.deleteMany({ hotel: { $in: existingHotelIds } });
  await Hotel.deleteMany({ owner: { $in: existingOwnerIds } });
  await Owner.deleteMany({ email: { $in: ownerEmails } });
  await User.deleteMany({ email: { $in: reviewerEmails } });

  const hashedPassword = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);

  const owners = await Owner.insertMany(
    OWNERS.map((o) => ({ ...o, password: hashedPassword, isEmailVerified: true, status: 'active' }))
  );

  const reviewers = await User.insertMany(
    REVIEWERS.map((r) => ({ ...r, password: hashedPassword, isEmailVerified: true }))
  );

  for (let i = 0; i < HOTELS.length; i += 1) {
    const spec = HOTELS[i];
    const slug = slugify(spec.name);
    const owner = owners[i % owners.length];

    const hotel = await Hotel.create({
      owner: owner._id,
      name: spec.name,
      description: `${spec.name} offers a comfortable stay in ${spec.city} with modern amenities and warm hospitality, perfect for both business and leisure travelers.`,
      address: { street: `${spec.name} Road`, city: spec.city, country: spec.country },
      location: { lat: 27.7 + Math.random() * 0.5, lng: 85.3 + Math.random() * 0.5 },
      amenities: randomAmenities(),
      images: [0, 1, 2, 3].map((n) => pickImage(slug, n)),
      starRating: spec.starRating,
      status: 'approved',
    });

    const roomCount = 2 + Math.floor(Math.random() * 2);
    const rooms = ROOM_TYPES.slice(0, roomCount).map((rt, idx) => ({
      hotel: hotel._id,
      type: rt.type,
      price: rt.price,
      capacity: rt.capacity,
      amenities: randomAmenities(3),
      images: [pickImage(`${slug}-room-${idx}`, 0)],
      totalRooms: 5 + Math.floor(Math.random() * 10),
      isActive: true,
    }));
    await Room.insertMany(rooms);

    const reviewCount = 2 + Math.floor(Math.random() * 3);
    const chosenReviewers = shuffle(reviewers).slice(0, reviewCount);
    const ratings = chosenReviewers.map(() => 3 + Math.floor(Math.random() * 3));

    await Review.insertMany(
      chosenReviewers.map((reviewer, idx) => ({
        user: reviewer._id,
        hotel: hotel._id,
        rating: ratings[idx],
        comment: REVIEW_COMMENTS[idx % REVIEW_COMMENTS.length],
      }))
    );

    hotel.avgRating = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
    hotel.reviewCount = ratings.length;
    hotel.viewCount = Math.floor(Math.random() * 200);
    await hotel.save();
  }

  console.log(`Seeded ${owners.length} owners, ${reviewers.length} demo users, ${HOTELS.length} hotels with rooms and reviews.`);
  console.log(`Demo login password for all seeded accounts: ${SEED_PASSWORD}`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(async (err) => {
  console.error('Failed to seed public data:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
