const { query, queryOne, transaction } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { loadCart } = require('./cart.controller');

/**
 * POST /orders/checkout
 * Creates an order from the cart and enrolls the learner.
 * Payment: this build uses a demo gateway (`payment_method: 'demo'`) that marks the
 * order as paid instantly. Plug SSLCommerz in `services/payment.service.js` later.
 */
const checkout = asyncHandler(async (req, res) => {
  const cart = await loadCart(req);
  if (!cart.items.length) throw ApiError.badRequest('Your cart is empty');

  const result = await transaction(async (conn) => {
    const orderNumber = 'GE-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100);
    const [o] = await conn.query(
      "INSERT INTO orders (order_number, user_id, subtotal, discount, total, payment_method, payment_status, transaction_id, paid_at) VALUES (?, ?, ?, ?, ?, ?, 'paid', ?, NOW())",
      [orderNumber, req.user.id, cart.subtotal, cart.discount, cart.total, req.body.payment_method || 'sslcommerz', 'DEMO-' + orderNumber]
    );
    const orderId = o.insertId;
    const enrolledCourses = [];
    for (const item of cart.items) {
      if (item.type === 'course') {
        await conn.query("INSERT INTO order_items (order_id, item_type, course_id, title, price) VALUES (?, 'course', ?, ?, ?)", [orderId, item.course_id, item.title, item.after_discount_price]);
        await conn.query("INSERT IGNORE INTO enrollments (user_id, course_id, order_id, source) VALUES (?, ?, ?, ?)", [req.user.id, item.course_id, orderId, item.after_discount_price > 0 ? 'purchase' : 'free']);
        enrolledCourses.push(item.course_id);
      } else {
        await conn.query("INSERT INTO order_items (order_id, item_type, bundle_id, title, price) VALUES (?, 'bundle', ?, ?, ?)", [orderId, item.bundle_id, item.title, item.after_discount_price]);
        const [courses] = await conn.query('SELECT course_id FROM bundle_courses WHERE bundle_id = ?', [item.bundle_id]);
        for (const bc of courses) {
          await conn.query("INSERT IGNORE INTO enrollments (user_id, course_id, order_id, source) VALUES (?, ?, ?, 'bundle')", [req.user.id, bc.course_id, orderId]);
          enrolledCourses.push(bc.course_id);
        }
        await conn.query('UPDATE bundles SET total_enroll = total_enroll + 1 WHERE id = ?', [item.bundle_id]);
      }
    }
    if (enrolledCourses.length) {
      await conn.query(`UPDATE courses SET total_enroll = total_enroll + 1 WHERE id IN (${enrolledCourses.map(() => '?').join(',')})`, enrolledCourses);
    }
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return { order_id: orderId, order_number: orderNumber, total: cart.total, enrolled: enrolledCourses.length };
  });

  res.status(201).json({ success: true, message: 'Payment successful. You are now enrolled!', order: result });
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

module.exports = { checkout, enrollFree, list };
