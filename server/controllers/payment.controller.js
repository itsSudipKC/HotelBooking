import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Booking from '../models/Booking.model.js';
import Payment from '../models/Payment.model.js';
import * as esewa from '../services/esewa.service.js';
import * as khalti from '../services/khalti.service.js';

const resultUrl = (status, bookingId) =>
  `${process.env.CLIENT_URL}/user/payments/result?status=${status}${bookingId ? `&bookingId=${bookingId}` : ''}`;

export const initiatePayment = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;

  const booking = await Booking.findOne({ _id: bookingId, user: req.account._id });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  if (booking.status !== 'confirmed') {
    throw new ApiError(400, 'Only confirmed bookings can be paid for');
  }

  const alreadyPaid = await Payment.findOne({ booking: booking._id, status: 'success' });
  if (alreadyPaid) {
    throw new ApiError(400, 'This booking has already been paid for');
  }

  if (method === 'esewa' && !esewa.isEsewaConfigured()) {
    throw new ApiError(503, 'eSewa is not configured yet. Please try again later or pay by another method.');
  }
  if (method === 'khalti' && !khalti.isKhaltiConfigured()) {
    throw new ApiError(503, 'Khalti is not configured yet. Please try again later or pay by another method.');
  }

  const transactionId = `PAY-${booking._id}-${Date.now()}`;
  const baseUrl = `${req.protocol}://${req.get('host')}`;

  const payment = await Payment.create({
    booking: booking._id,
    user: req.account._id,
    method,
    amount: booking.totalPrice,
    transactionId,
    status: 'pending',
  });

  if (method === 'esewa') {

    const { formUrl, fields } = esewa.buildPaymentForm({
      amount: booking.totalPrice,
      transactionUuid: transactionId,
      successUrl: `${baseUrl}/api/payments/esewa/callback`,
      failureUrl: `${baseUrl}/api/payments/esewa/callback`,
    });
    return res.status(200).json(new ApiResponse(200, { method, formUrl, fields }));
  }


  const data = await khalti.initiate({
    amount: booking.totalPrice,
    purchaseOrderId: transactionId,
    purchaseOrderName: `Booking ${booking.invoiceNumber}`,
    customerInfo: { name: req.account.name, email: req.account.email, phone: req.account.phone || '9800000000' },
    returnUrl: `${baseUrl}/api/payments/khalti/callback`,
    websiteUrl: process.env.CLIENT_URL,
  });

  payment.referenceId = data.pidx;
  await payment.save();

  return res.status(200).json(new ApiResponse(200, { method, paymentUrl: data.payment_url }));
});

export const handleEsewaCallback = asyncHandler(async (req, res) => {
  const { data } = req.query;
  const decoded = data ? esewa.decodeCallbackData(data) : null;

  if (!decoded?.transaction_uuid) {
    return res.redirect(resultUrl('failed'));
  }

  const payment = await Payment.findOne({ transactionId: decoded.transaction_uuid, method: 'esewa' });
  if (!payment) {
    return res.redirect(resultUrl('failed'));
  }

  const { success, raw } = await esewa.verifyTransaction({
    transactionUuid: payment.transactionId,
    totalAmount: payment.amount,
  });

  payment.rawResponse = raw;
  payment.referenceId = decoded.transaction_code || payment.referenceId;
  payment.status = success ? 'success' : 'failed';
  if (success) payment.verifiedAt = new Date();
  await payment.save();

  if (success) {
    await Booking.updateOne({ _id: payment.booking }, { payment: payment._id });
  }

  return res.redirect(resultUrl(success ? 'success' : 'failed', String(payment.booking)));
});

export const handleKhaltiCallback = asyncHandler(async (req, res) => {
  const { pidx } = req.query;
  if (!pidx) {
    return res.redirect(resultUrl('failed'));
  }

  const payment = await Payment.findOne({ referenceId: pidx, method: 'khalti' });
  if (!payment) {
    return res.redirect(resultUrl('failed'));
  }

  const { success, raw } = await khalti.lookup({ pidx });

  payment.rawResponse = raw;
  payment.status = success ? 'success' : 'failed';
  if (success) {
    payment.verifiedAt = new Date();
    payment.referenceId = raw.transaction_id || payment.referenceId;
  }
  await payment.save();

  if (success) {
    await Booking.updateOne({ _id: payment.booking }, { payment: payment._id });
  }

  return res.redirect(resultUrl(success ? 'success' : 'failed', String(payment.booking)));
});

export const getPaymentForBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await Booking.findOne({ _id: bookingId, user: req.account._id });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }

  const payment = await Payment.findOne({ booking: booking._id }).sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, { payment }));
});
