const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { safeJson, paginate, paged } = require('../utils/format');

const LIST_SELECT = `a.id, a.title, a.slug, a.short_description, a.thumbnail, a.banner, a.author_name, a.author_photo, a.read_time,
  a.no_of_view, a.is_featured, a.published_date, a.tags, ac.id AS category_id, ac.name AS category_name, ac.slug AS category_slug`;

const shape = (a) => ({ ...a, tags: safeJson(a.tags, []), is_featured: !!a.is_featured });

/** GET /articles */
const list = asyncHandler(async (req, res) => {
  const { page, pageSize, offset } = paginate(req, { page: 1, pageSize: 9, max: 50 });
  const where = ['a.is_published = 1'];
  const params = [];
  if (req.query.search) { where.push('(a.title LIKE ? OR a.short_description LIKE ?)'); params.push(`%${req.query.search}%`, `%${req.query.search}%`); }
  if (req.query.category) { where.push('(ac.slug = ? OR ac.id = ?)'); params.push(req.query.category, parseInt(req.query.category, 10) || 0); }
  if (req.query.featured === 'true') where.push('a.is_featured = 1');
  const [{ total }] = await query(`SELECT COUNT(*) AS total FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE ${where.join(' AND ')}`, params);
  const order = req.query.sort === 'popular' ? 'a.no_of_view DESC' : 'a.published_date DESC, a.id DESC';
  const rows = await query(
    `SELECT ${LIST_SELECT} FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  res.json({ success: true, ...paged(rows.map(shape), total, page, pageSize) });
});

/** GET /articles/categories */
const categories = asyncHandler(async (_req, res) => {
  const rows = await query(
    'SELECT ac.id, ac.name, ac.slug, (SELECT COUNT(*) FROM articles a WHERE a.category_id = ac.id AND a.is_published = 1) AS total FROM article_categories ac ORDER BY ac.name'
  );
  res.json({ success: true, results: rows });
});

/** GET /articles/trending */
const trending = asyncHandler(async (_req, res) => {
  const rows = await query(`SELECT ${LIST_SELECT} FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_published = 1 ORDER BY a.no_of_view DESC LIMIT 5`);
  res.json({ success: true, results: rows.map(shape) });
});

/** GET /articles/:slug */
const detail = asyncHandler(async (req, res) => {
  const a = await queryOne(
    `SELECT ${LIST_SELECT}, a.body, a.author_bio FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.slug = ? AND a.is_published = 1`,
    [req.params.slug]
  );
  if (!a) throw ApiError.notFound('Article not found');
  await query('UPDATE articles SET no_of_view = no_of_view + 1 WHERE id = ?', [a.id]);
  const comments = await query(
    `SELECT c.id, c.body, c.created_at, u.name AS user_name, u.photo AS user_photo FROM article_comments c JOIN users u ON u.id = c.user_id
     WHERE c.article_id = ? ORDER BY c.created_at DESC`,
    [a.id]
  );
  const trendingRows = await query(
    `SELECT ${LIST_SELECT} FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_published = 1 AND a.id <> ? ORDER BY a.no_of_view DESC LIMIT 5`,
    [a.id]
  );
  res.json({ success: true, article: { ...shape(a), no_of_view: a.no_of_view + 1, comments }, trending: trendingRows.map(shape) });
});

/** POST /articles/:slug/comments */
const comment = asyncHandler(async (req, res) => {
  const body = String(req.body.body || '').trim();
  if (body.length < 2) throw ApiError.badRequest('Comment is too short');
  const a = await queryOne('SELECT id FROM articles WHERE slug = ?', [req.params.slug]);
  if (!a) throw ApiError.notFound('Article not found');
  const r = await query('INSERT INTO article_comments (article_id, user_id, body) VALUES (?, ?, ?)', [a.id, req.user.id, body.slice(0, 2000)]);
  res.status(201).json({ success: true, comment: { id: r.insertId, body, created_at: new Date(), user_name: req.user.name, user_photo: req.user.photo } });
});

module.exports = { list, categories, trending, detail, comment };
