import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listHotels = (params) => apiClient.get('/hotels', { params }).then((res) => res.data);

export const getFeaturedHotels = (limit) =>
  apiClient.get('/hotels/featured', { params: { limit } }).then((res) => res.data);

export const getRecommendedHotels = (token, limit) =>
  apiClient.get('/hotels/recommended', { ...authHeader(token), params: { limit } }).then((res) => res.data);

export const getHotelById = (id, params) => apiClient.get(`/hotels/${id}`, { params }).then((res) => res.data);

export const getSimilarHotels = (id) => apiClient.get(`/hotels/${id}/similar`).then((res) => res.data);

export const listHotelReviews = (id, params) =>
  apiClient.get(`/hotels/${id}/reviews`, { params }).then((res) => res.data);

export const chatWithHotel = (id, question) =>
  apiClient.post(`/hotels/${id}/chat`, { question }).then((res) => res.data);
