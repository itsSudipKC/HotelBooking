import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'mongo-sanitize';

import authRoutes from './routes/auth.routes.js';
import hotelRoutes from './routes/hotel.routes.js';
import contactRoutes from './routes/contact.routes.js';
import ownerDashboardRoutes from './routes/ownerDashboard.routes.js';
import adminDashboardRoutes from './routes/adminDashboard.routes.js';
import adminUserRoutes from './routes/adminUser.routes.js';
import adminOwnerRoutes from './routes/adminOwner.routes.js';
import adminHotelRoutes from './routes/adminHotel.routes.js';
import adminBookingRoutes from './routes/adminBooking.routes.js';
import ownerHotelRoutes from './routes/ownerHotel.routes.js';
import ownerRoomRoutes from './routes/ownerRoom.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import ownerBookingRoutes from './routes/ownerBooking.routes.js';
import { apiRateLimiter } from './middleware/rateLimiter.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Strips any keys starting with "$" or containing "." from user input to
// block MongoDB operator injection (e.g. { "email": { "$ne": null } }).
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize(req.body);
  if (req.params) req.params = mongoSanitize(req.params);
  next();
});

app.use('/api', apiRateLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/owner', ownerDashboardRoutes);
app.use('/api/owner/hotels', ownerHotelRoutes);
app.use('/api/owner/rooms', ownerRoomRoutes);
app.use('/api/owner/bookings', ownerBookingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/owners', adminOwnerRoutes);
app.use('/api/admin/hotels', adminHotelRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
