import 'dotenv/config';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.model.js';

const SALT_ROUNDS = 12;

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in server/.env before seeding.');
    process.exit(1);
  }

  await connectDB();

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const admin = await Admin.findOneAndUpdate(
    { email: ADMIN_EMAIL },
    {
      $set: {
        name: ADMIN_NAME || 'Administrator',
        email: ADMIN_EMAIL,
        password: hashedPassword,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`Admin account ready: ${admin.email}`);
  await mongoose.disconnect();
  process.exit(0);
};

seedAdmin().catch(async (err) => {
  console.error('Failed to seed admin:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});
