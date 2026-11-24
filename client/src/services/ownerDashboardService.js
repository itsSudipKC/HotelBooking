// import apiClient from './apiClient';

// export const getSummary = (accessToken) =>
//   apiClient
//     .get('/owner/dashboard-summary', { headers: { Authorization: `Bearer ${accessToken}` } })
//     .then((res) => res.data);


import apiClient from './apiClient';

export const getSummary = (accessToken) =>
  apiClient
    .get('/owner/dashboard-summary', { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((res) => res.data);

export const getEarnings = (accessToken) =>
  apiClient
    .get('/owner/dashboard-earnings', { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((res) => res.data);