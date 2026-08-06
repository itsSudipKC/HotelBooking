import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listBookings = (token, params) =>
  apiClient.get('/owner/bookings', { ...authHeader(token), params }).then((res) => res.data);

export const getBookingById = (token, id) =>
  apiClient.get(`/owner/bookings/${id}`, authHeader(token)).then((res) => res.data);

export const acceptBooking = (token, id) =>
  apiClient.patch(`/owner/bookings/${id}/accept`, null, authHeader(token)).then((res) => res.data);

export const rejectBooking = (token, id, reason) =>
  apiClient.patch(`/owner/bookings/${id}/reject`, { reason }, authHeader(token)).then((res) => res.data);
