const { pool } = require('../config/db');

/**
 * Marks an order as paid and delivers what was bought:
 *  - course items      -> enrolment
 *  - bundle items      -> enrolment in every course of the bundle
 *  - subscription item -> user_subscriptions row (Learner Plus)
 * Idempotent: a second call for an already paid order is a no-op.
 */
async function fulfilOrder(orderId, { transactionId = null, paymentMethod = null } = {}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[order]] = await conn.query('SELECT * FROM orders WHERE id = ? FOR UPDATE', [orderId]);
    if (!order) throw new Error('Order not found');
    if (order.payment_status === 'paid') { await conn.commit(); return { order, already: true }; }

    const [items] = await conn.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    const courses = new Set();
    for (const it of items) {
      if (it.item_type === 'course' && it.course_id) {
        await conn.query('INSERT IGNORE INTO enrollments (user_id, course_id, order_id, source) VALUES (?, ?, ?, ?)', [order.user_id, it.course_id, orderId, Number(it.price) > 0 ? 'purchase' : 'free']);
        courses.add(it.course_id);
      } else if (it.item_type === 'bundle' && it.bundle_id) {
        const [bc] = await conn.query('SELECT course_id FROM bundle_courses WHERE bundle_id = ?', [it.bundle_id]);
        for (const r of bc) {
          await conn.query("INSERT IGNORE INTO enrollments (user_id, course_id, order_id, source) VALUES (?, ?, ?, 'bundle')", [order.user_id, r.course_id, orderId]);
          courses.add(r.course_id);
        }
        await conn.query('UPDATE bundles SET total_enroll = total_enroll + 1 WHERE id = ?', [it.bundle_id]);
      } else if (it.item_type === 'subscription' && it.package_id) {
        const [[pkg]] = await conn.query('SELECT * FROM subscription_packages WHERE id = ?', [it.package_id]);
        const [[current]] = await conn.query("SELECT id, expires_at FROM user_subscriptions WHERE user_id = ? AND status = 'active' AND expires_at > NOW() ORDER BY expires_at DESC LIMIT 1", [order.user_id]);
        if (current) await conn.query("UPDATE user_subscriptions SET status = 'cancelled' WHERE id = ?", [current.id]);
        const start = current ? new Date(current.expires_at) : new Date();
        const expires = new Date(start);
        expires.setMonth(expires.getMonth() + ((pkg && pkg.duration) || 1));
        await conn.query('INSERT INTO user_subscriptions (user_id, package_id, order_id, starts_at, expires_at) VALUES (?, ?, ?, ?, ?)', [order.user_id, it.package_id, orderId, start, expires]);
      }
    }
    if (courses.size) {
      const ids = [...courses];
      await conn.query(`UPDATE courses SET total_enroll = total_enroll + 1 WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    }
    await conn.query(
      "UPDATE orders SET payment_status = 'paid', paid_at = NOW(), transaction_id = COALESCE(?, transaction_id), payment_method = COALESCE(?, payment_method) WHERE id = ?",
      [transactionId, paymentMethod, orderId]
    );
    await conn.query('DELETE FROM cart_items WHERE user_id = ?', [order.user_id]);
    await conn.commit();
    return { order: { ...order, payment_status: 'paid' }, enrolled: courses.size, already: false };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function markFailed(orderNumber, status = 'failed') {
  await pool.query("UPDATE orders SET payment_status = ? WHERE order_number = ? AND payment_status = 'pending'", [status, orderNumber]);
}

const newOrderNumber = (prefix = 'GE') => `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

module.exports = { fulfilOrder, markFailed, newOrderNumber };
