import apiClient from './apiClient';

export const listHotels = (params) => apiClient.get('/hotels', { params }).then((res) => res.data);

export const getFeaturedHotels = (limit) =>
  apiClient.get('/hotels/featured', { params: { limit } }).then((res) => res.data);

export const getHotelById = (id) => apiClient.get(`/hotels/${id}`).then((res) => res.data);

export const getSimilarHotels = (id) => apiClient.get(`/hotels/${id}/similar`).then((res) => res.data);

export const listHotelReviews = (id, params) =>
  apiClient.get(`/hotels/${id}/reviews`, { params }).then((res) => res.data);
