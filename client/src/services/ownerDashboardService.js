import apiClient from './apiClient';

export const getSummary = (accessToken) =>
  apiClient
    .get('/owner/dashboard-summary', { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((res) => res.data);
