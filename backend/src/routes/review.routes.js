const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { query, queryOne } = require('../config/db');

/** POST /reviews { course_id, rating, comment } - create or update my review */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const rating = parseInt(req.body.rating, 10);
    if (!(rating >= 1 && rating <= 5)) throw ApiError.badRequest('Rating must be between 1 and 5');
    const course = await queryOne('SELECT id FROM courses WHERE id = ?', [req.body.course_id]);
    if (!course) throw ApiError.notFound('Course not found');
    const comment = String(req.body.comment || '').trim().slice(0, 2000);
    await query(
      'INSERT INTO reviews (course_id, user_id, rating, comment) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE rating = VALUES(rating), comment = VALUES(comment), created_at = NOW()',
      [course.id, req.user.id, rating, comment]
    );
    const agg = await queryOne('SELECT COUNT(*) AS total, AVG(rating) AS avg FROM reviews WHERE course_id = ?', [course.id]);
    await query('UPDATE courses SET avg_rating = ?, total_rating = ? WHERE id = ?', [Number(agg.avg || 0).toFixed(2), agg.total, course.id]);
    res.status(201).json({ success: true, message: 'Thanks for your review!', review: { rating, comment, user_name: req.user.name, user_photo: req.user.photo, created_at: new Date() } });
  })
);

module.exports = router;
