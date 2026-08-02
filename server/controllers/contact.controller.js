import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import { sendContactMessageEmail } from '../services/email.service.js';

export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  await sendContactMessageEmail({ name, email, subject, message });

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Your message has been sent. We will get back to you soon.'));
});
