import apiClient from './apiClient';

export const submitContactMessage = (payload) => apiClient.post('/contact', payload).then((res) => res.data);
