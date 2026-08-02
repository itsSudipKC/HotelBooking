import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { verifyAccessToken } from '../services/token.service.js';
import User from '../models/User.model.js';
import Owner from '../models/Owner.model.js';
import Admin from '../models/Admin.model.js';

const MODELS_BY_ROLE = {
  user: User,
  owner: Owner,
  admin: Admin,
};

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new ApiError(401, 'Access token missing');
  }

  let decoded;
  try {
    decoded = verifyAccessToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired access token');
  }

  const Model = MODELS_BY_ROLE[decoded.role];
  if (!Model) {
    throw new ApiError(401, 'Invalid token role');
  }

  const account = await Model.findById(decoded.id);
  if (!account) {
    throw new ApiError(401, 'Account no longer exists');
  }

  if (account.status === 'suspended') {
    throw new ApiError(403, 'This account has been suspended');
  }

  req.account = account;
  req.role = decoded.role;
  next();
});

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.role || !roles.includes(req.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};
