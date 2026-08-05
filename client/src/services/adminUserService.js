import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listUsers = (token, params) =>
  apiClient.get('/admin/users', { ...authHeader(token), params }).then((res) => res.data);

export const getUserById = (token, id) =>
  apiClient.get(`/admin/users/${id}`, authHeader(token)).then((res) => res.data);

export const suspendUser = (token, id) =>
  apiClient.patch(`/admin/users/${id}/suspend`, null, authHeader(token)).then((res) => res.data);

export const activateUser = (token, id) =>
  apiClient.patch(`/admin/users/${id}/activate`, null, authHeader(token)).then((res) => res.data);

export const deleteUser = (token, id) =>
  apiClient.delete(`/admin/users/${id}`, authHeader(token)).then((res) => res.data);
