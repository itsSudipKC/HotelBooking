export const getErrorMessage = (err) =>
  err?.response?.data?.message || 'Something went wrong. Please try again.';

export const getFieldErrors = (err) => err?.response?.data?.errors || [];
