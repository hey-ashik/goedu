const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, paged } = require('../utils/format');
const { toCard, CARD_SELECT, CARD_FROM } = require('./course.controller');

const INSTRUCTOR_SELECT = `i.id, i.name, i.slug, i.photo, i.designation, i.institute_name, i.specialist, i.about, i.featured_topic, i.promo_video,
  i.is_featured, i.is_mentor, i.mentor_category, i.mentor_rating, i.mentor_reviews, i.session_price, i.session_minutes,
  (SELECT COUNT(*) FROM courses c WHERE c.owner_id = i.id AND c.status = 2) AS total_course,
  (SELECT COALESCE(SUM(c.total_enroll),0) FROM courses c WHERE c.owner_id = i.id) AS total_student_enrolled`;

const shape = (i) => ({
  ...i,
  photo: i.photo || '/placeholder.svg',
  is_featured: !!i.is_featured,
  is_mentor: !!i.is_mentor,
  specialties: i.specialist ? String(i.specialist).split(',').map((s) => s.trim()).filter(Boolean) : [],
  mentor_rating: Number(i.mentor_rating || 5),
  session_price: i.session_price !== null && i.session_price !== undefined ? Number(i.session_price) : null,
});

/** GET /instructors?featured=true */
const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = paginate(req, { page: 1, pageSize: 12, max: 60 });
  const where = ['1=1'];
  const params = [];
  if (req.query.featured === 'true') where.push('i.is_featured = 1');
  if (req.query.search) { where.push('(i.name LIKE ? OR i.specialist LIKE ? OR i.institute_name LIKE ?)'); params.push(`%${req.query.search}%`, `%${req.query.search}%`, `%${req.query.search}%`); }
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM instructors i WHERE ${where.join(' AND ')}`, params);
  const rows = await query(`SELECT ${INSTRUCTOR_SELECT} FROM instructors i WHERE ${where.join(' AND ')} ORDER BY i.is_featured DESC, i.sort_order, total_student_enrolled DESC LIMIT ? OFFSET ?`, [...params, pageSize, offset]);
  res.json({ success: true, ...paged(rows.map(shape), total, page, pageSize) });
});

/** GET /instructors/:slug */
const detail = asyncHandler(async (req, res) => {
  const i = await queryOne(`SELECT ${INSTRUCTOR_SELECT} FROM instructors i WHERE i.slug = ?`, [req.params.slug]);
  if (!i) throw ApiError.notFound('Instructor not found');
  const courses = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.owner_id = ? AND c.status = 2 ORDER BY c.total_enroll DESC`, [i.id]);
  res.json({ success: true, instructor: { ...shape(i), courses: courses.map(toCard) } });
});

// ---------------- Mentorship ----------------

/** GET /mentorship/mentors */
const mentors = asyncHandler(async (req, res) => {
  const where = ['i.is_mentor = 1'];
  const params = [];
  if (req.query.search) { where.push('(i.name LIKE ? OR i.specialist LIKE ? OR i.mentor_category LIKE ? OR i.designation LIKE ?)'); const s = `%${req.query.search}%`; params.push(s, s, s, s); }
  if (req.query.category) { where.push('i.mentor_category = ?'); params.push(req.query.category); }
  const order = req.query.sort === 'price_low' ? 'i.session_price ASC' : req.query.sort === 'price_high' ? 'i.session_price DESC' : req.query.sort === 'rating' ? 'i.mentor_rating DESC' : 'i.is_featured DESC, i.sort_order, i.id';
  const rows = await query(`SELECT ${INSTRUCTOR_SELECT} FROM instructors i WHERE ${where.join(' AND ')} ORDER BY ${order}`, params);
  res.json({ success: true, count: rows.length, results: rows.map(shape) });
});

/** GET /mentorship/categories */
const mentorCategories = asyncHandler(async (_req, res) => {
  const rows = await query('SELECT mentor_category AS name, COUNT(*) AS total FROM instructors WHERE is_mentor = 1 AND mentor_category IS NOT NULL GROUP BY mentor_category ORDER BY total DESC, name');
  res.json({ success: true, results: rows });
});

/** GET /mentorship/mentors/:slug */
const mentorDetail = asyncHandler(async (req, res) => {
  const i = await queryOne(`SELECT ${INSTRUCTOR_SELECT} FROM instructors i WHERE i.slug = ? AND i.is_mentor = 1`, [req.params.slug]);
  if (!i) throw ApiError.notFound('Mentor not found');
  const courses = await query(`SELECT ${CARD_SELECT} ${CARD_FROM} WHERE c.owner_id = ? AND c.status = 2 ORDER BY c.total_enroll DESC LIMIT 6`, [i.id]);
  // next 6 available slots (10:00, 14:30, 18:00 today/tomorrow/day after)
  const slots = [];
  const now = new Date();
  for (let d = 0; d < 3 && slots.length < 6; d++) {
    for (const [h, m] of [[10, 0], [14, 30], [18, 0]]) {
      const t = new Date(now); t.setDate(now.getDate() + d); t.setHours(h, m, 0, 0);
      if (t > now) slots.push(t.toISOString());
    }
  }
  res.json({ success: true, mentor: { ...shape(i), courses: courses.map(toCard), slots: slots.slice(0, 6) } });
});

/** POST /mentorship/bookings */
const book = asyncHandler(async (req, res) => {
  const { mentor_id, slot_at, note } = req.body;
  const mentor = await queryOne('SELECT id, name FROM instructors WHERE id = ? AND is_mentor = 1', [mentor_id]);
  if (!mentor) throw ApiError.notFound('Mentor not found');
  const when = new Date(slot_at);
  if (Number.isNaN(when.getTime()) || when < new Date()) throw ApiError.badRequest('Please choose a valid future time slot');
  const clash = await queryOne("SELECT id FROM mentor_bookings WHERE mentor_id = ? AND slot_at = ? AND status <> 'cancelled'", [mentor.id, when]);
  if (clash) throw ApiError.conflict('This slot has just been booked. Please pick another one.');
  const r = await query('INSERT INTO mentor_bookings (mentor_id, user_id, slot_at, note) VALUES (?, ?, ?, ?)', [mentor.id, req.user.id, when, note || null]);
  res.status(201).json({ success: true, booking: { id: r.insertId, mentor: mentor.name, slot_at: when, status: 'pending' } });
});

/** GET /mentorship/bookings (mine) */
const myBookings = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT b.id, b.slot_at, b.status, b.note, b.created_at, i.name AS mentor_name, i.photo AS mentor_photo, i.designation, i.slug AS mentor_slug
     FROM mentor_bookings b JOIN instructors i ON i.id = b.mentor_id WHERE b.user_id = ? ORDER BY b.slot_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, results: rows });
});

module.exports = { list, detail, mentors, mentorCategories, mentorDetail, book, myBookings };
