import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listRoomsForHotel = (token, hotelId) =>
  apiClient.get(`/owner/hotels/${hotelId}/rooms`, authHeader(token)).then((res) => res.data);

export const createRoom = (token, hotelId, payload) =>
  apiClient.post(`/owner/hotels/${hotelId}/rooms`, payload, authHeader(token)).then((res) => res.data);

export const updateRoom = (token, id, payload) =>
  apiClient.put(`/owner/rooms/${id}`, payload, authHeader(token)).then((res) => res.data);

export const deleteRoom = (token, id) =>
  apiClient.delete(`/owner/rooms/${id}`, authHeader(token)).then((res) => res.data);

export const toggleRoomActive = (token, id) =>
  apiClient.patch(`/owner/rooms/${id}/toggle-active`, null, authHeader(token)).then((res) => res.data);
