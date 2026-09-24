const { query, queryOne, transaction } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { safeJson } = require('../utils/format');
const { newOrderNumber } = require('../services/order.service');

const shape = (p) => ({
  ...p,
  price: Number(p.price),
  discount_price: Number(p.discount_price),
  is_discount: !!p.is_discount,
  save_amount: Number(p.save_amount),
  save_percentage: Number(p.save_percentage),
  effective_price: p.is_discount && Number(p.discount_price) > 0 ? Number(p.discount_price) : Number(p.price),
  perks: safeJson(p.perks, []),
});

async function activeSubscription(userId) {
  return queryOne(
    `SELECT us.id, us.starts_at, us.expires_at, us.status, us.package_id, p.title AS package_title, p.package_choice
     FROM user_subscriptions us JOIN subscription_packages p ON p.id = us.package_id
     WHERE us.user_id = ? AND us.status = 'active' AND us.expires_at > NOW() ORDER BY us.expires_at DESC LIMIT 1`,
    [userId]
  );
}

/** GET /subscription/packages */
const packages = asyncHandler(async (req, res) => {
  const rows = await query('SELECT * FROM subscription_packages WHERE is_active = 1 ORDER BY duration');
  const yearly = rows.find((r) => r.package_choice === 'year');
  const perDay = yearly ? (Number(yearly.is_discount ? yearly.discount_price : yearly.price) / 365).toFixed(2) : null;
  const [{ n: libraryCount }] = await query('SELECT COUNT(*) AS n FROM courses WHERE status = 2 AND is_subscription = 1');
  const user_info = req.user ? await activeSubscription(req.user.id) : null;
  res.json({ success: true, results: rows.map(shape), per_day: perDay, library_count: libraryCount, user_info });
});

/** GET /subscription/library - courses included in the subscription */
const library = asyncHandler(async (req, res) => {
  const { toCard, CARD_SELECT, CARD_FROM } = require('./course.controller');
  const rows = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.status = 2 AND c.is_subscription = 1 ORDER BY c.total_enroll DESC LIMIT 60`);
  res.json({ success: true, results: rows.map(toCard) });
});

/** POST /subscription/subscribe { package_id } - creates the order and starts payment (SSLCommerz or direct) */
const subscribe = asyncHandler(async (req, res) => {
  const pkg = await queryOne('SELECT * FROM subscription_packages WHERE id = ? AND is_active = 1', [req.body.package_id]);
  if (!pkg) throw ApiError.notFound('Package not found');
  const current = await activeSubscription(req.user.id);
  if (current && current.package_id === pkg.id) throw ApiError.conflict('This plan is already active on your account');
  const price = pkg.is_discount && Number(pkg.discount_price) > 0 ? Number(pkg.discount_price) : Number(pkg.price);
  const order = await transaction(async (conn) => {
    const orderNumber = newOrderNumber('GE-SUB');
    const [o] = await conn.query(
      "INSERT INTO orders (order_number, user_id, subtotal, discount, total, payment_method, payment_status) VALUES (?, ?, ?, 0, ?, 'sslcommerz', 'pending')",
      [orderNumber, req.user.id, price, price]
    );
    await conn.query("INSERT INTO order_items (order_id, item_type, package_id, title, price) VALUES (?, 'subscription', ?, ?, ?)", [o.insertId, pkg.id, 'Learner Plus - ' + pkg.title, price]);
    return { id: o.insertId, order_number: orderNumber, total: price };
  });
  const { startPayment } = require('./order.controller');
  await startPayment(req, res, order, 'GoEdu Learner Plus (' + pkg.title + ')');
});

/** POST /subscription/cancel */
const cancel = asyncHandler(async (req, res) => {
  const current = await activeSubscription(req.user.id);
  if (!current) throw ApiError.badRequest('You do not have an active subscription');
  await query("UPDATE user_subscriptions SET status = 'cancelled' WHERE id = ?", [current.id]);
  res.json({ success: true, message: 'Subscription cancelled. Access continues until ' + current.expires_at });
});

/** GET /subscription/status */
const status = asyncHandler(async (req, res) => {
  res.json({ success: true, subscription: await activeSubscription(req.user.id) });
});

module.exports = { packages, library, subscribe, cancel, status, activeSubscription };
