import apiClient from './apiClient';

export const getSummary = (accessToken) =>
  apiClient
    .get('/admin/dashboard-summary', { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((res) => res.data);
