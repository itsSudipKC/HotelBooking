import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file was provided');
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { url: `/uploads/${req.file.filename}`, publicId: req.file.filename }, 'Image uploaded.'));
});
