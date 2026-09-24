const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { safeJson, paginate, paged } = require('../utils/format');
const { toCard, CARD_SELECT, CARD_FROM } = require('./course.controller');

const shape = (b) => ({
  ...b,
  price: Number(b.price),
  discount_price: Number(b.discount_price),
  is_discount: !!b.is_discount,
  is_featured: !!b.is_featured,
  effective_price: b.is_discount && Number(b.discount_price) > 0 ? Number(b.discount_price) : Number(b.price),
  savings: Math.max(0, Number(b.price) - (b.is_discount ? Number(b.discount_price) : Number(b.price))),
  career_outcome: safeJson(b.career_outcome, []),
  what_you_learn: safeJson(b.what_you_learn, []),
});

/** GET /bundles */
const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = paginate(req, { page: 1, pageSize: 12, max: 50 });
  const where = ['b.is_active = 1'];
  const params = [];
  if (req.query.search) { where.push('(b.title LIKE ? OR b.short_description LIKE ?)'); params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
  if (req.query.featured === 'true') where.push('b.is_featured = 1');
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM bundles b WHERE ${where.join(' AND ')}`, params);
  const rows = await query(
    `SELECT b.*, (SELECT COUNT(*) FROM bundle_courses bc WHERE bc.bundle_id = b.id) AS total_courses,
            (SELECT COALESCE(SUM(c.course_length),0) FROM bundle_courses bc JOIN courses c ON c.id = bc.course_id WHERE bc.bundle_id = b.id) AS total_length
     FROM bundles b WHERE ${where.join(' AND ')} ORDER BY b.is_featured DESC, b.id ASC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  res.json({ success: true, ...paged(rows.map(shape), total, page, pageSize) });
});

/** GET /bundles/:slug */
const detail = asyncHandler(async (req, res) => {
  const b = await queryOne('SELECT * FROM bundles WHERE slug = ? AND is_active = 1', [req.params.slug]);
  if (!b) throw ApiError.notFound('Bundle not found');
  const courses = await query(
    `SELECT ${CARD_SELECT}, bc.sort_order ${CARD_FROM} JOIN bundle_courses bc ON bc.course_id = c.id WHERE bc.bundle_id = ? ORDER BY bc.sort_order`,
    [b.id]
  );
  let enrolled = false;
  if (req.user && courses.length) {
    const [{ n }] = await query(`SELECT COUNT(*) AS n FROM enrollments WHERE user_id = ? AND course_id IN (${courses.map(() => '?').join(',')})`, [req.user.id, ...courses.map((c) => c.id)]);
    enrolled = n === courses.length;
  }
  const others = await query('SELECT id, title, slug, short_description, thumbnail, price, discount_price, is_discount FROM bundles WHERE is_active = 1 AND id <> ? ORDER BY id LIMIT 6', [b.id]);
  res.json({
    success: true,
    bundle: {
      ...shape(b),
      courses: courses.map(toCard),
      total_courses: courses.length,
      total_lessons: courses.reduce((n, c) => n + (c.total_lesson || 0), 0),
      total_length: courses.reduce((n, c) => n + (c.course_length || 0), 0),
      enrolled,
      other_bundles: others.map(shape),
    },
  });
});

module.exports = { list, detail, shape };
