import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import User from '../models/User.model.js';
import EmailVerificationToken from '../models/EmailVerificationToken.model.js';
import { generateSecureToken } from '../utils/crypto.js';
import { sendVerificationEmail } from '../services/email.service.js';

const SALT_ROUNDS = 12;
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h

const sanitize = (account) => {
  const obj = account.toObject();
  delete obj.password;
  delete obj.refreshTokenVersion;
  return obj;
};

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body;
  const account = req.account;

  account.name = name;
  account.phone = phone || '';

  let emailChanged = false;
  if (email && email !== account.email) {
    const existing = await User.findOne({ email, _id: { $ne: account._id } });
    if (existing) {
      throw new ApiError(409, 'That email is already in use by another account');
    }
    account.email = email;
    account.isEmailVerified = false;
    emailChanged = true;
  }

  await account.save();

  if (emailChanged) {
    const { token, tokenHash } = generateSecureToken();
    await EmailVerificationToken.create({
      accountRole: 'user',
      accountId: account._id,
      accountModel: 'User',
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
    });

    const verifyUrl = `${process.env.CLIENT_URL}/user/verify-email/${token}`;
    await sendVerificationEmail({ to: account.email, name: account.name, verifyUrl });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { account: sanitize(account) },
      emailChanged
        ? 'Profile updated. Please check your new email address to verify it.'
        : 'Profile updated.'
    )
  );
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const account = await User.findById(req.account._id).select('+password');
  const isMatch = await bcrypt.compare(currentPassword, account.password);
  if (!isMatch) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  account.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  account.refreshTokenVersion += 1; // invalidate other sessions, same as the reset-password flow
  await account.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password changed. Please log in again.'));
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const { url, publicId } = req.body;
  if (!url) {
    throw new ApiError(400, 'An uploaded image url is required');
  }

  const account = req.account;
  account.avatar = { url, publicId: publicId || '' };
  await account.save();

  return res.status(200).json(new ApiResponse(200, { account: sanitize(account) }, 'Profile picture updated.'));
});
