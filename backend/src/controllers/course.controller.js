const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { safeJson, formatDuration, paginate, paged } = require('../utils/format');

const CARD_SELECT = `
  c.id, c.title, c.slug, c.thumbnail, c.level, c.level_name, c.type, c.price, c.is_discount, c.discount_price,
  c.is_free, c.is_subscription, c.is_trending, c.is_top_pick, c.total_enroll, c.avg_rating, c.total_rating,
  c.course_length, c.total_lesson, c.created_at, c.tags, c.category_id, c.language_id,
  cat.title AS category_name, parent.title AS parent_category, lang.name AS language_name,
  i.id AS instructor_id, i.name AS instructor_name, i.slug AS instructor_slug, i.photo AS instructor_photo, i.designation AS instructor_title
`;
const CARD_FROM = `
  FROM courses c
  LEFT JOIN categories cat ON cat.id = c.category_id
  LEFT JOIN categories parent ON parent.id = cat.parent_id
  LEFT JOIN languages lang ON lang.id = c.language_id
  LEFT JOIN instructors i ON i.id = c.owner_id
`;

/** Shapes a DB row into the public course card payload used by the frontend. */
function toCard(row) {
  const enroll = row.total_enroll || 0;
  const reviews = enroll >= 1e6 ? (enroll / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : enroll >= 1e3 ? (enroll / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(enroll);
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    thumbnail: row.thumbnail || '/placeholder.svg',
    level: row.level,
    level_name: row.level_name,
    type: row.type,
    price: Number(row.price),
    is_discount: !!row.is_discount,
    discount_price: Number(row.discount_price),
    effective_price: row.is_discount && Number(row.discount_price) > 0 ? Number(row.discount_price) : Number(row.price),
    is_free: !!row.is_free,
    is_subscription: !!row.is_subscription,
    is_trending: !!row.is_trending,
    is_top_pick: !!row.is_top_pick,
    category_id: row.category_id,
    category_name: row.category_name,
    parent_category: row.parent_category,
    language_name: row.language_name,
    tags: safeJson(row.tags, []),
    total_enroll: enroll,
    reviews_label: reviews,
    rating_percent: Math.round(20 * Number(row.avg_rating || 0)),
    avg_rating: Number(row.avg_rating || 0),
    total_rating: row.total_rating || 0,
    course_length: row.course_length,
    duration_label: formatDuration(row.course_length),
    total_lesson: row.total_lesson,
    created_at: row.created_at,
    instructor: {
      id: row.instructor_id,
      name: row.instructor_name,
      slug: row.instructor_slug,
      photo: row.instructor_photo || '/placeholder.svg',
      title: row.instructor_title || 'Instructor',
    },
  };
}

function buildFilters(q) {
  const where = ['c.status = 2'];
  const params = [];
  if (q.search || q.title || q.query) {
    const s = `%${String(q.search || q.title || q.query).trim()}%`;
    where.push('(c.title LIKE ? OR c.keywords LIKE ? OR i.name LIKE ? OR cat.title LIKE ?)');
    params.push(s, s, s, s);
  }
  if (q.category) {
    // accepts a parent or sub category id (or comma separated ids)
    const ids = String(q.category).split(',').map((n) => parseInt(n, 10)).filter(Boolean);
    if (ids.length) {
      where.push(`(c.category_id IN (${ids.map(() => '?').join(',')}) OR cat.parent_id IN (${ids.map(() => '?').join(',')}))`);
      params.push(...ids, ...ids);
    }
  }
  if (q.category_slug) {
    where.push('(cat.slug = ? OR parent.slug = ?)');
    params.push(q.category_slug, q.category_slug);
  }
  if (q.tier === 'free') where.push('c.price = 0');
  if (q.tier === 'paid') where.push('c.price > 0 AND c.is_subscription = 0');
  if (q.tier === 'subscription') where.push('c.is_subscription = 1');
  if (q.level) {
    const levels = String(q.level).split(',').map((l) => l.trim()).filter(Boolean);
    where.push(`c.level_name IN (${levels.map(() => '?').join(',')})`);
    params.push(...levels);
  }
  if (q.language) {
    const langs = String(q.language).split(',').map((n) => parseInt(n, 10)).filter(Boolean);
    if (langs.length) { where.push(`c.language_id IN (${langs.map(() => '?').join(',')})`); params.push(...langs); }
  }
  if (q.instructor) { where.push('i.slug = ?'); params.push(q.instructor); }
  if (q.trending === 'true') where.push('c.is_trending = 1');
  if (q.top_picks === 'true') where.push('c.is_top_pick = 1');
  return { where: where.join(' AND '), params };
}

const ORDERS = {
  newest: 'c.created_at DESC',
  oldest: 'c.created_at ASC',
  popular: 'c.total_enroll DESC, c.created_at DESC',
  rating: 'c.avg_rating DESC, c.total_rating DESC',
  price_low: 'c.price ASC',
  price_high: 'c.price DESC',
  title: 'c.title ASC',
};

/** GET /courses */
const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = paginate(req, { page: 1, pageSize: 12, max: 60 });
  const { where, params } = buildFilters(req.query);
  const order = ORDERS[req.query.sort] || ORDERS.newest;
  const [{ total }] = await query(`SELECT COUNT(*) AS total ${CARD_FROM} WHERE ${where}`, params);
  const rows = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE ${where} ORDER BY ${order} LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  res.json({ success: true, ...paged(rows.map(toCard), total, page, pageSize) });
});

/** GET /courses/search?q= (quick search for the hero bar) */
const search = asyncHandler(async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (q.length < 2) return res.json({ success: true, results: [] });
  const s = `%${q}%`;
  const rows = await query(
    `SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.status = 2 AND (c.title LIKE ? OR c.keywords LIKE ? OR cat.title LIKE ?) ORDER BY c.total_enroll DESC LIMIT 8`,
    [s, s, s]
  );
  res.json({ success: true, results: rows.map(toCard) });
});

/** GET /courses/popular?category=ID  (trending in a category, used on the home slider) */
const popular = asyncHandler(async (req, res) => {
  const { where, params } = buildFilters({ ...req.query });
  let rows = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE ${where} AND c.is_trending = 1 ORDER BY c.total_enroll DESC LIMIT 12`, params);
  if (!rows.length) rows = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE ${where} ORDER BY c.total_enroll DESC LIMIT 12`, params);
  res.json({ success: true, results: rows.map(toCard) });
});

/** GET /courses/top-picks */
const topPicks = asyncHandler(async (req, res) => {
  const limit = Math.min(30, parseInt(req.query.limit, 10) || 12);
  const rows = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.status = 2 AND c.is_top_pick = 1 ORDER BY c.total_enroll DESC LIMIT ?`, [limit]);
  res.json({ success: true, results: rows.map(toCard) });
});

/** GET /courses/:slug */
const detail = asyncHandler(async (req, res) => {
  const row = await queryOne(
    `SELECT ${CARD_SELECT}, c.banner, c.promo_video, c.meta_description, c.description, c.what_you_learn, c.keywords,
            c.total_quiz, c.total_assignment, c.shareable_certificate, c.full_online, c.flexible_schedule, c.updated_at,
            i.institute_name AS instructor_institute, i.about AS instructor_about,
            (SELECT COUNT(*) FROM courses cc WHERE cc.owner_id = i.id AND cc.status = 2) AS instructor_courses,
            (SELECT COALESCE(SUM(cc.total_enroll),0) FROM courses cc WHERE cc.owner_id = i.id) AS instructor_students
     ${CARD_FROM} WHERE c.slug = ? LIMIT 1`,
    [req.params.slug]
  );
  if (!row) throw ApiError.notFound('Course not found');

  const sections = await query('SELECT id, title, sort_order FROM course_sections WHERE course_id = ? ORDER BY sort_order, id', [row.id]);
  const lessons = await query(
    'SELECT id, section_id, title, type, duration_seconds, is_free_preview, sort_order FROM course_lessons WHERE course_id = ? ORDER BY sort_order, id',
    [row.id]
  );
  const bySection = new Map(sections.map((s) => [s.id, { ...s, lessons: [], duration_seconds: 0 }]));
  for (const l of lessons) {
    const s = bySection.get(l.section_id);
    if (s) { s.lessons.push({ ...l, is_free_preview: !!l.is_free_preview }); s.duration_seconds += l.duration_seconds; }
  }

  const reviews = await query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.photo AS user_photo
     FROM reviews r JOIN users u ON u.id = r.user_id WHERE r.course_id = ? ORDER BY r.created_at DESC LIMIT 20`,
    [row.id]
  );
  const ratingRow = await queryOne('SELECT COUNT(*) AS total, COALESCE(AVG(rating),0) AS avg FROM reviews WHERE course_id = ?', [row.id]);

  let enroll_status = 'not_enrolled';
  let wish_list_status = false;
  let user_review = null;
  if (req.user) {
    const e = await queryOne('SELECT id, progress FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, row.id]);
    if (e) enroll_status = 'enrolled';
    wish_list_status = !!(await queryOne('SELECT 1 FROM wishlist WHERE user_id = ? AND course_id = ?', [req.user.id, row.id]));
    user_review = await queryOne('SELECT id, rating, comment FROM reviews WHERE user_id = ? AND course_id = ?', [req.user.id, row.id]);
  }

  const card = toCard(row);
  const totalMinutes = Math.round((row.course_length || 0) / 60);
  res.json({
    success: true,
    course: {
      ...card,
      banner: row.banner,
      promo_video: row.promo_video,
      meta_description: row.meta_description,
      description: row.description,
      what_you_learn: row.what_you_learn,
      keywords: row.keywords,
      total_quiz: row.total_quiz,
      total_assignment: row.total_assignment,
      total_hours: Math.max(1, Math.round(totalMinutes / 60)),
      total_length_label: totalMinutes >= 60 ? `${Math.floor(totalMinutes / 60)} hr ${totalMinutes % 60}min` : `${totalMinutes} min`,
      shareable_certificate: !!row.shareable_certificate,
      full_online: !!row.full_online,
      flexible_schedule: !!row.flexible_schedule,
      updated_at: row.updated_at,
      instructor: {
        ...card.instructor,
        institute: row.instructor_institute,
        about: row.instructor_about,
        total_course: row.instructor_courses,
        total_student_enrolled: row.instructor_students,
      },
      sections: [...bySection.values()],
      section_count: sections.length,
      lecture_count: lessons.length,
      reviews,
      review_summary: { total: ratingRow.total, avg: Number(ratingRow.avg).toFixed(1) },
      enroll_status,
      wish_list_status,
      user_review,
    },
  });
});

/** GET /courses/:slug/related */
const related = asyncHandler(async (req, res) => {
  const course = await queryOne('SELECT id, category_id FROM courses WHERE slug = ?', [req.params.slug]);
  if (!course) throw ApiError.notFound('Course not found');
  const rows = await query(
    `SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.status = 2 AND c.id <> ? AND (c.category_id = ? OR c.is_top_pick = 1)
     ORDER BY (c.category_id = ?) DESC, c.total_enroll DESC LIMIT 12`,
    [course.id, course.category_id, course.category_id]
  );
  res.json({ success: true, results: rows.map(toCard) });
});

module.exports = { list, search, popular, topPicks, detail, related, toCard, CARD_SELECT, CARD_FROM };
