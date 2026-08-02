import crypto from 'crypto';

// Returns { token, tokenHash } — the raw token is sent to the user (email link),
// only the hash is persisted, so a leaked DB never exposes usable tokens.
export const generateSecureToken = () => {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
};

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
