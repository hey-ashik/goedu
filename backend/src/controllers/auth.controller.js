const bcrypt = require('bcryptjs');
const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../middleware/auth');
const env = require('../config/env');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, phone: u.phone, photo: u.photo, role: u.role, created_at: u.created_at });

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

async function attachSubscription(user) {
  const sub = await queryOne(
    `SELECT us.id, us.starts_at, us.expires_at, us.status, p.title AS package_title, p.package_choice
     FROM user_subscriptions us JOIN subscription_packages p ON p.id = us.package_id
     WHERE us.user_id = ? AND us.status = 'active' AND us.expires_at > NOW() ORDER BY us.expires_at DESC LIMIT 1`,
    [user.id]
  );
  return { ...user, subscription: sub || null, subscription_benefit: sub ? 20 : 0 };
}

/** POST /auth/register */
const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name).trim();
  const email = String(req.body.email).trim().toLowerCase();
  const password = String(req.body.password);
  if (password.length < 6) throw ApiError.badRequest('Validation failed', { password: 'Password must be at least 6 characters' });
  const exists = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) throw ApiError.conflict('An account with this email already exists. Please login.');
  const hash = await bcrypt.hash(password, 10);
  const result = await query('INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)', [name, email, hash, req.body.phone || null]);
  const user = await queryOne('SELECT id, name, email, phone, photo, role, created_at FROM users WHERE id = ?', [result.insertId]);
  // merge guest cart into the new account
  await query('UPDATE cart_items SET user_id = ?, guest_id = NULL WHERE guest_id = ?', [user.id, req.guestId]);
  const token = signToken(user);
  res.cookie('goedu_token', token, cookieOptions());
  res.status(201).json({ success: true, token, user: await attachSubscription(publicUser(user)) });
});

/** POST /auth/login */
const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email).trim().toLowerCase();
  const user = await queryOne('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !(await bcrypt.compare(String(req.body.password), user.password_hash))) {
    throw ApiError.unauthorized('Invalid email or password');
  }
  if (!user.is_active) throw ApiError.forbidden('This account has been deactivated');
  await query(
    `UPDATE cart_items g SET g.user_id = ?, g.guest_id = NULL
     WHERE g.guest_id = ? AND NOT EXISTS (SELECT 1 FROM (SELECT course_id FROM cart_items WHERE user_id = ?) u WHERE u.course_id = g.course_id)`,
    [user.id, req.guestId, user.id]
  );
  await query('DELETE FROM cart_items WHERE guest_id = ?', [req.guestId]);
  const token = signToken(user);
  res.cookie('goedu_token', token, cookieOptions());
  res.json({ success: true, token, user: await attachSubscription(publicUser(user)) });
});

/** POST /auth/logout */
const logout = asyncHandler(async (_req, res) => {
  res.clearCookie('goedu_token');
  res.json({ success: true });
});

/** GET /auth/me */
const me = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await attachSubscription(publicUser(req.user)) });
});

/** PUT /auth/profile */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, photo } = req.body;
  await query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), photo = COALESCE(?, photo) WHERE id = ?', [
    name ? String(name).trim() : null, phone ?? null, photo ?? null, req.user.id,
  ]);
  const user = await queryOne('SELECT id, name, email, phone, photo, role, created_at FROM users WHERE id = ?', [req.user.id]);
  res.json({ success: true, user: await attachSubscription(publicUser(user)) });
});

/** PUT /auth/password */
const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!new_password || String(new_password).length < 6) throw ApiError.badRequest('New password must be at least 6 characters');
  const user = await queryOne('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
  if (!(await bcrypt.compare(String(current_password || ''), user.password_hash))) throw ApiError.badRequest('Current password is incorrect');
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [await bcrypt.hash(String(new_password), 10), req.user.id]);
  res.json({ success: true, message: 'Password updated' });
});

module.exports = { register, login, logout, me, updateProfile, changePassword, attachSubscription, publicUser };
