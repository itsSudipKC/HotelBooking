import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const updateProfile = (token, payload) =>
  apiClient.patch('/users/me', payload, authHeader(token)).then((res) => res.data);

export const changePassword = (token, payload) =>
  apiClient.patch('/users/me/password', payload, authHeader(token)).then((res) => res.data);

export const updateAvatar = (token, payload) =>
  apiClient.patch('/users/me/avatar', payload, authHeader(token)).then((res) => res.data);
