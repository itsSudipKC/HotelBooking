import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createBooking = (token, payload) =>
  apiClient.post('/bookings', payload, authHeader(token)).then((res) => res.data);

export const listMyBookings = (token, params) =>
  apiClient.get('/bookings/my', { ...authHeader(token), params }).then((res) => res.data);

export const getMyBookingById = (token, id) =>
  apiClient.get(`/bookings/my/${id}`, authHeader(token)).then((res) => res.data);

export const cancelBooking = (token, id, reason) =>
  apiClient.patch(`/bookings/my/${id}/cancel`, { reason }, authHeader(token)).then((res) => res.data);
