import apiClient from './apiClient';

const authHeader = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const listOwners = (token, params) =>
  apiClient.get('/admin/owners', { ...authHeader(token), params }).then((res) => res.data);

export const getOwnerById = (token, id) =>
  apiClient.get(`/admin/owners/${id}`, authHeader(token)).then((res) => res.data);

export const createOwner = (token, payload) =>
  apiClient.post('/admin/owners', payload, authHeader(token)).then((res) => res.data);

export const suspendOwner = (token, id) =>
  apiClient.patch(`/admin/owners/${id}/suspend`, null, authHeader(token)).then((res) => res.data);

export const activateOwner = (token, id) =>
  apiClient.patch(`/admin/owners/${id}/activate`, null, authHeader(token)).then((res) => res.data);

export const deleteOwner = (token, id) =>
  apiClient.delete(`/admin/owners/${id}`, authHeader(token)).then((res) => res.data);
