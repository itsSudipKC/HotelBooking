import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import Admin from '../models/Admin.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import { generateSecureToken, hashToken } from '../utils/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
  refreshCookieName,
} from '../services/token.service.js';
import { sendPasswordResetEmail } from '../services/email.service.js';

// Admin has no self-registration (see scripts/seedAdmin.js) and no email
// verification step, so this mirrors the shared auth controller minus those
// two flows rather than forcing Admin through the User/Owner factory.

const SALT_ROUNDS = 12;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h
const ROLE = 'admin';

const sanitizeAdmin = (admin) => {
  const obj = admin.toObject();
  delete obj.password;
  delete obj.refreshTokenVersion;
  return obj;
};

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const accessToken = signAccessToken({ id: admin._id, role: ROLE });
  const refreshToken = signRefreshToken({ id: admin._id, role: ROLE, version: admin.refreshTokenVersion });

  res.cookie(refreshCookieName(ROLE), refreshToken, refreshCookieOptions(ROLE));

  return res
    .status(200)
    .json(new ApiResponse(200, { account: sanitizeAdmin(admin), accessToken, role: ROLE }, 'Login successful'));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const admin = await Admin.findOne({ email });

  if (admin) {
    const { token, tokenHash } = generateSecureToken();
    await PasswordResetToken.create({
      accountRole: ROLE,
      accountId: admin._id,
      accountModel: 'Admin',
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetUrl = `${process.env.CLIENT_URL}/admin/reset-password/${token}`;
    await sendPasswordResetEmail({ to: admin.email, name: admin.name, resetUrl });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'If an account with that email exists, a reset link has been sent.'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  const tokenHash = hashToken(token);

  const record = await PasswordResetToken.findOne({
    tokenHash,
    accountRole: ROLE,
    expiresAt: { $gt: new Date() },
  });

  if (!record) {
    throw new ApiError(400, 'Reset link is invalid or has expired');
  }

  const admin = await Admin.findById(record.accountId);
  if (!admin) {
    throw new ApiError(404, 'Account not found');
  }

  admin.password = await bcrypt.hash(password, SALT_ROUNDS);
  admin.refreshTokenVersion += 1;
  await admin.save();
  await PasswordResetToken.deleteMany({ accountId: admin._id, accountRole: ROLE });

  return res.status(200).json(new ApiResponse(200, null, 'Password reset successful. You can now log in.'));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.[refreshCookieName(ROLE)];
  if (!incoming) {
    throw new ApiError(401, 'Refresh token missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(incoming);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  if (decoded.role !== ROLE) {
    throw new ApiError(401, 'Invalid refresh token for this role');
  }

  const admin = await Admin.findById(decoded.id);
  if (!admin || admin.refreshTokenVersion !== decoded.version) {
    throw new ApiError(401, 'Refresh token no longer valid, please log in again');
  }

  const accessToken = signAccessToken({ id: admin._id, role: ROLE });
  const newRefreshToken = signRefreshToken({ id: admin._id, role: ROLE, version: admin.refreshTokenVersion });

  res.cookie(refreshCookieName(ROLE), newRefreshToken, refreshCookieOptions(ROLE));

  return res.status(200).json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
});

export const logout = asyncHandler(async (req, res) => {
  const incoming = req.cookies?.[refreshCookieName(ROLE)];

  if (incoming) {
    try {
      const decoded = verifyRefreshToken(incoming);
      if (decoded.role === ROLE) {
        await Admin.findByIdAndUpdate(decoded.id, { $inc: { refreshTokenVersion: 1 } });
      }
    } catch (err) {
      // already invalid/expired — nothing to invalidate
    }
  }

  res.clearCookie(refreshCookieName(ROLE), { path: `/api/auth/${ROLE}` });
  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, { account: sanitizeAdmin(req.account), role: req.role }));
});
