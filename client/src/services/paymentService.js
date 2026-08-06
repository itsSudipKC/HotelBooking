import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const initiatePayment = (token, payload) =>
  apiClient.post('/payments/initiate', payload, authHeader(token)).then((res) => res.data);

export const getPaymentForBooking = (token, bookingId) =>
  apiClient.get(`/payments/booking/${bookingId}`, authHeader(token)).then((res) => res.data);
