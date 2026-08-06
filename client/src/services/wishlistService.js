import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listMyWishlist = (token) => apiClient.get('/wishlist/my', authHeader(token)).then((res) => res.data);

export const getWishlistStatus = (token, hotelId) =>
  apiClient.get(`/wishlist/status/${hotelId}`, authHeader(token)).then((res) => res.data);

export const toggleWishlist = (token, hotelId) =>
  apiClient.patch(`/wishlist/toggle/${hotelId}`, null, authHeader(token)).then((res) => res.data);
