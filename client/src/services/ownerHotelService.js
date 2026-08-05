import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listMyHotels = (token) => apiClient.get('/owner/hotels', authHeader(token)).then((res) => res.data);

export const getMyHotelById = (token, id) =>
  apiClient.get(`/owner/hotels/${id}`, authHeader(token)).then((res) => res.data);

export const createHotel = (token, payload) =>
  apiClient.post('/owner/hotels', payload, authHeader(token)).then((res) => res.data);

export const updateHotel = (token, id, payload) =>
  apiClient.put(`/owner/hotels/${id}`, payload, authHeader(token)).then((res) => res.data);

export const deleteHotel = (token, id) =>
  apiClient.delete(`/owner/hotels/${id}`, authHeader(token)).then((res) => res.data);
