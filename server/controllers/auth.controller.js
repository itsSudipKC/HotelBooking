import bcrypt from 'bcrypt';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import EmailVerificationToken from '../models/EmailVerificationToken.model.js';
import PasswordResetToken from '../models/PasswordResetToken.model.js';
import { generateSecureToken, hashToken } from '../utils/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshCookieOptions,
  refreshCookieName,
} from '../services/token.service.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service.js';

const SALT_ROUNDS = 12;
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1h

const sanitizeAccount = (account) => {
  const obj = account.toObject();
  delete obj.password;
  delete obj.refreshTokenVersion;
  return obj;
};

/**
 * Builds the register/login/verify/forgot/reset/refresh/logout handlers for a
 * given role. User and Owner are behaviourally identical apart from the
 * Mongoose model, the welcome email, and the accountModel string used on the
 * shared token collections — everything else (hashing, token issuance,
 * cookie handling) is common, so it lives here once instead of twice.
 */
export const buildAuthController = ({ role, Model, accountModel, sendWelcomeEmail }) => {
  const register = asyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body;

    const existing = await Model.findOne({ email });
    if (existing) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const account = await Model.create({
      name,
      email,
      password: hashedPassword,
      phone,
    });

    const { token, tokenHash } = generateSecureToken();
    await EmailVerificationToken.create({
      accountRole: role,
      accountId: account._id,
      accountModel,
      tokenHash,
      expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL_MS),
    });

    const verifyUrl = `${process.env.CLIENT_URL}/${role}/verify-email/${token}`;
    await sendVerificationEmail({ to: account.email, name: account.name, verifyUrl });

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { id: account._id, email: account.email },
          'Registration successful. Please check your email to verify your account.'
        )
      );
  });

  const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const tokenHash = hashToken(token);

    const record = await EmailVerificationToken.findOne({
      tokenHash,
      accountRole: role,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ApiError(400, 'Verification link is invalid or has expired');
    }

    const account = await Model.findById(record.accountId);
    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    account.isEmailVerified = true;
    await account.save();
    await EmailVerificationToken.deleteMany({ accountId: account._id, accountRole: role });

    if (sendWelcomeEmail) {
      await sendWelcomeEmail({ to: account.email, name: account.name });
    }

    return res.status(200).json(new ApiResponse(200, null, 'Email verified successfully. You can now log in.'));
  });

  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const account = await Model.findOne({ email }).select('+password');
    if (!account) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!account.isEmailVerified) {
      throw new ApiError(403, 'Please verify your email before logging in');
    }

    if (account.status === 'suspended') {
      throw new ApiError(403, 'This account has been suspended. Contact support for help.');
    }

    const accessToken = signAccessToken({ id: account._id, role });
    const refreshToken = signRefreshToken({
      id: account._id,
      role,
      version: account.refreshTokenVersion,
    });

    res.cookie(refreshCookieName(role), refreshToken, refreshCookieOptions(role));

    return res
      .status(200)
      .json(new ApiResponse(200, { account: sanitizeAccount(account), accessToken, role }, 'Login successful'));
  });

  const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const account = await Model.findOne({ email });

    // Always respond the same way so this endpoint can't be used to enumerate registered emails.
    if (account) {
      const { token, tokenHash } = generateSecureToken();
      await PasswordResetToken.create({
        accountRole: role,
        accountId: account._id,
        accountModel,
        tokenHash,
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      });

      const resetUrl = `${process.env.CLIENT_URL}/${role}/reset-password/${token}`;
      await sendPasswordResetEmail({ to: account.email, name: account.name, resetUrl });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, 'If an account with that email exists, a reset link has been sent.'));
  });

  const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    const tokenHash = hashToken(token);

    const record = await PasswordResetToken.findOne({
      tokenHash,
      accountRole: role,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      throw new ApiError(400, 'Reset link is invalid or has expired');
    }

    const account = await Model.findById(record.accountId);
    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    account.password = await bcrypt.hash(password, SALT_ROUNDS);
    account.refreshTokenVersion += 1; // invalidate any outstanding refresh tokens/sessions
    await account.save();
    await PasswordResetToken.deleteMany({ accountId: account._id, accountRole: role });

    return res.status(200).json(new ApiResponse(200, null, 'Password reset successful. You can now log in.'));
  });

  const refreshTokenHandler = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.[refreshCookieName(role)];
    if (!incoming) {
      throw new ApiError(401, 'Refresh token missing');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(incoming);
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    if (decoded.role !== role) {
      throw new ApiError(401, 'Invalid refresh token for this role');
    }

    const account = await Model.findById(decoded.id);
    if (!account || account.refreshTokenVersion !== decoded.version) {
      throw new ApiError(401, 'Refresh token no longer valid, please log in again');
    }

    const accessToken = signAccessToken({ id: account._id, role });
    const newRefreshToken = signRefreshToken({
      id: account._id,
      role,
      version: account.refreshTokenVersion,
    });

    res.cookie(refreshCookieName(role), newRefreshToken, refreshCookieOptions(role));

    return res.status(200).json(new ApiResponse(200, { accessToken }, 'Access token refreshed'));
  });

  const logout = asyncHandler(async (req, res) => {
    const incoming = req.cookies?.[refreshCookieName(role)];

    if (incoming) {
      try {
        const decoded = verifyRefreshToken(incoming);
        if (decoded.role === role) {
          await Model.findByIdAndUpdate(decoded.id, { $inc: { refreshTokenVersion: 1 } });
        }
      } catch (err) {
        // token already invalid/expired — nothing to invalidate, fall through to clearing the cookie
      }
    }

    res.clearCookie(refreshCookieName(role), { path: `/api/auth/${role}` });
    return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
  });

  const getMe = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, { account: sanitizeAccount(req.account), role: req.role }));
  });

  return {
    register,
    verifyEmail,
    login,
    forgotPassword,
    resetPassword,
    refreshToken: refreshTokenHandler,
    logout,
    getMe,
  };
};
