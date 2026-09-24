const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const { query, queryOne } = require('../config/db');

/** GET /users/dashboard - summary numbers for the learner dashboard */
router.get(
  '/dashboard',
  requireAuth,
  asyncHandler(async (req, res) => {
    const uid = req.user.id;
    const [enrolled] = await query('SELECT COUNT(*) AS n, COALESCE(SUM(progress >= 100),0) AS completed FROM enrollments WHERE user_id = ?', [uid]);
    const [orders] = await query("SELECT COUNT(*) AS n, COALESCE(SUM(total),0) AS spent FROM orders WHERE user_id = ? AND payment_status = 'paid'", [uid]);
    const [wish] = await query('SELECT COUNT(*) AS n FROM wishlist WHERE user_id = ?', [uid]);
    const [bookings] = await query("SELECT COUNT(*) AS n FROM mentor_bookings WHERE user_id = ? AND status <> 'cancelled'", [uid]);
    const sub = await queryOne(
      `SELECT us.expires_at, p.title FROM user_subscriptions us JOIN subscription_packages p ON p.id = us.package_id
       WHERE us.user_id = ? AND us.status = 'active' AND us.expires_at > NOW() ORDER BY us.expires_at DESC LIMIT 1`,
      [uid]
    );
    const recent = await query(
      `SELECT c.id, c.title, c.slug, c.thumbnail, e.progress, e.enrolled_at FROM enrollments e JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ? ORDER BY e.enrolled_at DESC LIMIT 4`,
      [uid]
    );
    res.json({
      success: true,
      stats: {
        enrolled: enrolled.n,
        completed: Number(enrolled.completed),
        in_progress: enrolled.n - Number(enrolled.completed),
        orders: orders.n,
        spent: Number(orders.spent),
        wishlist: wish.n,
        bookings: bookings.n,
        subscription: sub,
      },
      recent,
    });
  })
);

module.exports = router;
