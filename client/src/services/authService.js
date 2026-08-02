import apiClient from './apiClient';

const base = (role) => `/auth/${role}`;

export const registerAccount = (role, { name, email, password, phone }) =>
  apiClient.post(`${base(role)}/register`, { name, email, password, phone }).then((res) => res.data);

export const verifyEmail = (role, token) =>
  apiClient.get(`${base(role)}/verify-email/${token}`).then((res) => res.data);

export const login = (role, { email, password }) =>
  apiClient.post(`${base(role)}/login`, { email, password }).then((res) => res.data);

export const forgotPassword = (role, { email }) =>
  apiClient.post(`${base(role)}/forgot-password`, { email }).then((res) => res.data);

export const resetPassword = (role, token, { password }) =>
  apiClient.post(`${base(role)}/reset-password/${token}`, { password }).then((res) => res.data);

export const refreshToken = (role) => apiClient.post(`${base(role)}/refresh-token`).then((res) => res.data);

export const logout = (role) => apiClient.post(`${base(role)}/logout`).then((res) => res.data);

export const getMe = (role, accessToken) =>
  apiClient
    .get(`${base(role)}/me`, { headers: { Authorization: `Bearer ${accessToken}` } })
    .then((res) => res.data);
