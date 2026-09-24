const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');

const extractToken = (req) => {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  if (header.startsWith('Token ')) return header.slice(6);
  if (req.cookies && req.cookies.goedu_token) return req.cookies.goedu_token;
  return null;
};

/** Attaches req.user when a valid token exists; never fails. */
async function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const payload = jwt.verify(token, env.jwt.secret);
    const user = await queryOne(
      'SELECT id, name, email, phone, photo, role, created_at FROM users WHERE id = ? AND is_active = 1',
      [payload.sub]
    );
    if (user) req.user = user;
  } catch (_err) {
    // invalid/expired token -> treat as guest
  }
  next();
}

/** Requires a logged in user. */
async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {});
  if (!req.user) return next(ApiError.unauthorized('Please login to continue'));
  next();
}

const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden());
  next();
};

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role, email: user.email }, env.jwt.secret, { expiresIn: env.jwt.expiresIn });

module.exports = { optionalAuth, requireAuth, requireRole, signToken };
