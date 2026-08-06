import apiClient from './apiClient';

export const uploadImage = (token, file) => {
  const formData = new FormData();
  formData.append('image', file);

  return apiClient
    .post('/uploads/image', formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data);
};
