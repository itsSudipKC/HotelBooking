import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listHotels = (token, params) =>
  apiClient.get('/admin/hotels', { ...authHeader(token), params }).then((res) => res.data);

export const getHotelById = (token, id) =>
  apiClient.get(`/admin/hotels/${id}`, authHeader(token)).then((res) => res.data);

export const approveHotel = (token, id) =>
  apiClient.patch(`/admin/hotels/${id}/approve`, null, authHeader(token)).then((res) => res.data);

export const rejectHotel = (token, id, reason) =>
  apiClient.patch(`/admin/hotels/${id}/reject`, { reason }, authHeader(token)).then((res) => res.data);

export const deleteHotel = (token, id) =>
  apiClient.delete(`/admin/hotels/${id}`, authHeader(token)).then((res) => res.data);
