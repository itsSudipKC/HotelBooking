import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listBookings = (token, params) =>
  apiClient.get('/admin/bookings', { ...authHeader(token), params }).then((res) => res.data);

export const getBookingById = (token, id) =>
  apiClient.get(`/admin/bookings/${id}`, authHeader(token)).then((res) => res.data);
