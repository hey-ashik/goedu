const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { toCard, CARD_SELECT, CARD_FROM } = require('./course.controller');

/** GET /learning - my enrolled courses */
const myLearning = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT ${CARD_SELECT}, e.progress, e.enrolled_at, e.completed_at, e.source ${CARD_FROM}
     JOIN enrollments e ON e.course_id = c.id WHERE e.user_id = ? ORDER BY e.enrolled_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, results: rows.map((r) => ({ ...toCard(r), progress: Number(r.progress), enrolled_at: r.enrolled_at, completed_at: r.completed_at, source: r.source })) });
});

/** GET /learning/:slug - course player payload (curriculum + completed lessons) */
const player = asyncHandler(async (req, res) => {
  const course = await queryOne('SELECT id, title, slug, thumbnail, promo_video, total_lesson FROM courses WHERE slug = ?', [req.params.slug]);
  if (!course) throw ApiError.notFound('Course not found');
  const enrollment = await queryOne('SELECT id, progress, completed_at FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');
  const sections = await query('SELECT id, title, sort_order FROM course_sections WHERE course_id = ? ORDER BY sort_order, id', [course.id]);
  const lessons = await query('SELECT id, section_id, title, type, duration_seconds, is_free_preview, video_url, sort_order FROM course_lessons WHERE course_id = ? ORDER BY sort_order, id', [course.id]);
  const done = await query('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  const doneSet = new Set(done.map((d) => d.lesson_id));
  const shaped = sections.map((s) => ({ ...s, lessons: lessons.filter((l) => l.section_id === s.id).map((l) => ({ ...l, completed: doneSet.has(l.id) })) }));
  res.json({ success: true, course, enrollment: { ...enrollment, progress: Number(enrollment.progress) }, sections: shaped, completed_count: doneSet.size, total_lessons: lessons.length });
});

/** POST /learning/:slug/progress { lesson_id, completed } */
const progress = asyncHandler(async (req, res) => {
  const course = await queryOne('SELECT id FROM courses WHERE slug = ?', [req.params.slug]);
  if (!course) throw ApiError.notFound('Course not found');
  const enrollment = await queryOne('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  if (!enrollment) throw ApiError.forbidden('You are not enrolled in this course');
  const lesson = await queryOne('SELECT id FROM course_lessons WHERE id = ? AND course_id = ?', [req.body.lesson_id, course.id]);
  if (!lesson) throw ApiError.notFound('Lesson not found');
  if (req.body.completed === false) await query('DELETE FROM lesson_progress WHERE user_id = ? AND lesson_id = ?', [req.user.id, lesson.id]);
  else await query('INSERT IGNORE INTO lesson_progress (user_id, lesson_id, course_id) VALUES (?, ?, ?)', [req.user.id, lesson.id, course.id]);
  const [{ total }] = await query('SELECT COUNT(*) AS total FROM course_lessons WHERE course_id = ?', [course.id]);
  const [{ done }] = await query('SELECT COUNT(*) AS done FROM lesson_progress WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
  const pct = total ? Math.round((done / total) * 10000) / 100 : 0;
  await query('UPDATE enrollments SET progress = ?, completed_at = IF(? >= 100, COALESCE(completed_at, NOW()), NULL) WHERE id = ?', [pct, pct, enrollment.id]);
  res.json({ success: true, progress: pct, completed_count: done, total_lessons: total });
});

module.exports = { myLearning, player, progress };
