const { query, queryOne, transaction } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const publicUrl = require('../utils/publicUrl');
const { loadCart } = require('./cart.controller');
const sslcommerz = require('../services/sslcommerz.service');
const { fulfilOrder, markFailed, newOrderNumber } = require('../services/order.service');

/**
 * Starts payment for a pending order.
 *  - total 0                -> fulfilled immediately (free items)
 *  - SSLCommerz configured  -> returns gateway_url for redirection
 *  - not configured         -> direct enrolment (so the shop works before the merchant account is approved)
 */
async function startPayment(req, res, order, productName) {
  const siteUrl = publicUrl(req);
  if (Number(order.total) <= 0) {
    const r = await fulfilOrder(order.id, { transactionId: 'FREE-' + order.order_number, paymentMethod: 'free' });
    return res.status(201).json({ success: true, paid: true, message: 'You are now enrolled!', order: { order_number: order.order_number, total: 0, enrolled: r.enrolled } });
  }
  if (sslcommerz.enabled()) {
    const { gatewayUrl } = await sslcommerz.initPayment({ order, user: req.user, siteUrl, apiUrl: `${siteUrl}/api/v1`, productName });
    return res.status(201).json({ success: true, paid: false, gateway_url: gatewayUrl, order: { order_number: order.order_number, total: Number(order.total) } });
  }
  const r = await fulfilOrder(order.id, { transactionId: 'DIRECT-' + order.order_number, paymentMethod: 'direct' });
  return res.status(201).json({ success: true, paid: true, message: 'Payment recorded. You are now enrolled!', order: { order_number: order.order_number, total: Number(order.total), enrolled: r.enrolled } });
}

/** POST /orders/checkout - creates a pending order from the cart and starts payment */
const checkout = asyncHandler(async (req, res) => {
  const cart = await loadCart(req);
  if (!cart.items.length) throw ApiError.badRequest('Your cart is empty');
  const order = await transaction(async (conn) => {
    const orderNumber = newOrderNumber('GE');
    const [o] = await conn.query(
      "INSERT INTO orders (order_number, user_id, subtotal, discount, total, payment_method, payment_status) VALUES (?, ?, ?, ?, ?, ?, 'pending')",
      [orderNumber, req.user.id, cart.subtotal, cart.discount, cart.total, req.body.payment_method || 'sslcommerz']
    );
    for (const item of cart.items) {
      await conn.query('INSERT INTO order_items (order_id, item_type, course_id, bundle_id, title, price) VALUES (?, ?, ?, ?, ?, ?)', [
        o.insertId, item.type, item.type === 'course' ? item.course_id : null, item.type === 'bundle' ? item.bundle_id : null, item.title, item.after_discount_price,
      ]);
    }
    return { id: o.insertId, order_number: orderNumber, total: cart.total };
  });
  const name = cart.items.length === 1 ? cart.items[0].title : `${cart.items.length} GoEdu courses`;
  await startPayment(req, res, order, name);
});

/** POST /orders/enroll-free { course_id } - direct enrolment for free & subscription courses */
const enrollFree = asyncHandler(async (req, res) => {
  const course = await queryOne('SELECT id, title, price, is_subscription FROM courses WHERE id = ? AND status = 2', [req.body.course_id]);
  if (!course) throw ApiError.notFound('Course not found');
  const already = await queryOne('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  if (already) return res.json({ success: true, message: 'You are already enrolled', enrolled: true });
  let source = 'free';
  if (Number(course.price) > 0) {
    if (!course.is_subscription) throw ApiError.badRequest('This is a paid course. Please purchase it first.');
    const { activeSubscription } = require('./subscription.controller');
    const sub = await activeSubscription(req.user.id);
    if (!sub) throw ApiError.forbidden('An active Learner Plus subscription is required for this course');
    source = 'subscription';
  }
  await query('INSERT INTO enrollments (user_id, course_id, source) VALUES (?, ?, ?)', [req.user.id, course.id, source]);
  await query('UPDATE courses SET total_enroll = total_enroll + 1 WHERE id = ?', [course.id]);
  res.status(201).json({ success: true, message: `Enrolled in "${course.title}"`, enrolled: true });
});

/** GET /orders */
const list = asyncHandler(async (req, res) => {
  const orders = await query('SELECT id, order_number, subtotal, discount, total, payment_method, payment_status, transaction_id, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  if (!orders.length) return res.json({ success: true, results: [] });
  const items = await query(
    `SELECT oi.order_id, oi.item_type, oi.title, oi.price, c.slug AS course_slug, c.thumbnail AS course_thumb, b.slug AS bundle_slug, b.thumbnail AS bundle_thumb
     FROM order_items oi LEFT JOIN courses c ON c.id = oi.course_id LEFT JOIN bundles b ON b.id = oi.bundle_id
     WHERE oi.order_id IN (${orders.map(() => '?').join(',')})`,
    orders.map((o) => o.id)
  );
  const byOrder = new Map(orders.map((o) => [o.id, { ...o, subtotal: Number(o.subtotal), discount: Number(o.discount), total: Number(o.total), items: [] }]));
  for (const it of items) byOrder.get(it.order_id).items.push({ ...it, price: Number(it.price), slug: it.course_slug || it.bundle_slug, thumbnail: it.course_thumb || it.bundle_thumb });
  res.json({ success: true, results: [...byOrder.values()] });
});

/** GET /orders/:orderNumber - status of one of my orders (payment result page) */
const status = asyncHandler(async (req, res) => {
  const order = await queryOne('SELECT id, order_number, total, payment_status, payment_method, transaction_id, created_at, paid_at FROM orders WHERE order_number = ? AND user_id = ?', [req.params.orderNumber, req.user.id]);
  if (!order) throw ApiError.notFound('Order not found');
  const items = await query('SELECT item_type, title, price, course_id, bundle_id, package_id FROM order_items WHERE order_id = ?', [order.id]);
  res.json({ success: true, order: { ...order, total: Number(order.total), items } });
});

// ---------------- SSLCommerz callbacks (public, called by the gateway) ----------------

async function settle(req, res, outcome) {
  const site = publicUrl(req);
  const tranId = req.body.tran_id || req.query.tran_id;
  const order = tranId ? await queryOne('SELECT id, order_number, total, payment_status FROM orders WHERE order_number = ?', [tranId]) : null;
  if (!order) return res.redirect(`${site}/payment/failed`);
  if (outcome === 'success') {
    try {
      const { valid, data } = await sslcommerz.validate(req.body.val_id || req.query.val_id);
      const amountOk = !data.amount || Math.abs(Number(data.amount) - Number(order.total)) < 1;
      if (valid && amountOk) {
        await fulfilOrder(order.id, { transactionId: data.tran_id || tranId, paymentMethod: (data.card_issuer || 'sslcommerz').toString().slice(0, 60) });
        return res.redirect(`${site}/payment/success?order=${encodeURIComponent(order.order_number)}`);
      }
    } catch (err) {
      console.error('[sslcommerz] validation error:', err.message);
    }
    await markFailed(order.order_number, 'failed');
    return res.redirect(`${site}/payment/failed?order=${encodeURIComponent(order.order_number)}`);
  }
  await markFailed(order.order_number, 'failed');
  return res.redirect(`${site}/payment/${outcome === 'cancel' ? 'cancelled' : 'failed'}?order=${encodeURIComponent(order.order_number)}`);
}

const sslSuccess = asyncHandler((req, res) => settle(req, res, 'success'));
const sslFail = asyncHandler((req, res) => settle(req, res, 'fail'));
const sslCancel = asyncHandler((req, res) => settle(req, res, 'cancel'));

/** POST /payments/sslcommerz/ipn - server to server notification */
const sslIpn = asyncHandler(async (req, res) => {
  const tranId = req.body.tran_id;
  const order = tranId ? await queryOne('SELECT id, total FROM orders WHERE order_number = ?', [tranId]) : null;
  if (order && req.body.status === 'VALID' && req.body.val_id) {
    const { valid, data } = await sslcommerz.validate(req.body.val_id);
    if (valid) await fulfilOrder(order.id, { transactionId: data.tran_id || tranId, paymentMethod: 'sslcommerz' });
  }
  res.json({ received: true });
});

module.exports = { checkout, enrollFree, list, status, sslSuccess, sslFail, sslCancel, sslIpn, startPayment };
