const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { query, queryOne } = require('../config/db');
const { toCard, CARD_SELECT, CARD_FROM } = require('../controllers/course.controller');

router.use(requireAuth);

/** GET /wishlist */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const rows = await query(`SELECT ${CARD_SELECT}, w.created_at AS wished_at ${CARD_FROM} JOIN wishlist w ON w.course_id = c.id WHERE w.user_id = ? ORDER BY w.created_at DESC`, [req.user.id]);
    res.json({ success: true, results: rows.map(toCard) });
  })
);

/** POST /wishlist/toggle { course_id } */
router.post(
  '/toggle',
  asyncHandler(async (req, res) => {
    const course = await queryOne('SELECT id FROM courses WHERE id = ?', [req.body.course_id]);
    if (!course) throw ApiError.notFound('Course not found');
    const existing = await queryOne('SELECT 1 FROM wishlist WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
    if (existing) {
      await query('DELETE FROM wishlist WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
      return res.json({ success: true, wished: false, message: 'Removed from wishlist' });
    }
    await query('INSERT INTO wishlist (user_id, course_id) VALUES (?, ?)', [req.user.id, course.id]);
    res.json({ success: true, wished: true, message: 'Added to wishlist' });
  })
);

module.exports = router;
