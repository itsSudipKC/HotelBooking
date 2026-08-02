import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

export const signAccessToken = ({ id, role }) =>
  jwt.sign({ id, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });

export const signRefreshToken = ({ id, role, version }) =>
  jwt.sign({ id, role, version }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });

export const verifyAccessToken = (token) => jwt.verify(token, ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, REFRESH_SECRET);

// Cookie name and path are scoped per role (userRefreshToken @ /api/auth/user,
// ownerRefreshToken @ /api/auth/owner, ...) so a single browser can hold an
// independent session per role — logging in as an Owner must not clobber an
// already-active User session, and vice versa.
export const refreshCookieName = (role) => `${role}RefreshToken`;

export const refreshCookieOptions = (role) => {
  const maxAgeMs = 7 * 24 * 60 * 60 * 1000; // fallback 7d, matches default REFRESH_EXPIRY
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: maxAgeMs,
    path: `/api/auth/${role}`,
  };
};
