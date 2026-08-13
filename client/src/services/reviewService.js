import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const createReview = (token, payload) =>
  apiClient.post('/reviews', payload, authHeader(token)).then((res) => res.data);
