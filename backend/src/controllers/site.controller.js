const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { isEmail } = require('../middleware/validate');

/** GET /categories - parents with nested sub categories + course counts */
const categories = asyncHandler(async (req, res) => {
  const rows = await query(
    `SELECT c.id, c.parent_id, c.title, c.slug, c.icon, c.is_featured, c.sort_order,
            (SELECT COUNT(*) FROM courses x WHERE x.status = 2 AND x.category_id = c.id) AS available_course
     FROM categories c ORDER BY c.sort_order, c.id`
  );
  const parents = rows.filter((r) => !r.parent_id).map((p) => ({ ...p, sub_categories: [], available_course: 0 }));
  const byId = new Map(parents.map((p) => [p.id, p]));
  for (const r of rows.filter((r) => r.parent_id)) {
    const p = byId.get(r.parent_id);
    if (p) { p.sub_categories.push(r); p.available_course += r.available_course; }
  }
  let results = parents;
  if (req.query.courses === 'true') results = parents.filter((p) => p.available_course > 0);
  results.forEach((p) => p.sub_categories.sort((a, b) => b.available_course - a.available_course));
  res.json({ success: true, count: results.length, results });
});

/** GET /site/settings - footer, contact, stats, review links */
const settings = asyncHandler(async (_req, res) => {
  const rows = await query('SELECT setting_key, setting_value FROM site_settings');
  const settings = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
  const [counts] = await query(
    `SELECT (SELECT COUNT(*) FROM courses WHERE status = 2) AS courses,
            (SELECT COUNT(DISTINCT owner_id) FROM courses WHERE status = 2) AS instructors`
  );
  const links = await query('SELECT id, title, link, position_name, position, sort_order FROM footer_links WHERE is_published = 1 ORDER BY position, sort_order');
  const languages = await query('SELECT id, name, flag FROM languages ORDER BY serial, id');
  res.json({
    success: true,
    settings: {
      ...settings,
      stats_courses: String(Math.max(Number(settings.stats_courses || 0), counts.courses)),
      stats_instructors: String(Math.max(Number(settings.stats_instructors || 0), counts.instructors)),
    },
    footer_links: {
      left: links.filter((l) => l.position_name === 'Left'),
      middle: links.filter((l) => l.position_name === 'Middle'),
      right: links.filter((l) => l.position_name === 'Right'),
    },
    languages,
  });
});

/** GET /site/testimonials?page=home|subscription */
const testimonials = asyncHandler(async (req, res) => {
  const page = ['home', 'subscription'].includes(req.query.page) ? req.query.page : 'home';
  const rows = await query('SELECT id, name, image, description, designation, institute, rating FROM testimonials WHERE page = ? ORDER BY sequence, id', [page]);
  res.json({ success: true, results: rows });
});

/** POST /site/newsletter */
const newsletter = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (req.body.website) return res.json({ success: true, message: 'Subscribed' }); // honeypot
  if (!isEmail(email)) throw ApiError.badRequest('Please enter a valid email address');
  await query('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)', [email]);
  res.json({ success: true, message: 'Thanks for subscribing! You will hear from us soon.' });
});

/** POST /site/contact */
const contact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !isEmail(email || '') || !message) throw ApiError.badRequest('Name, a valid email and a message are required');
  await query('INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)', [
    String(name).trim(), String(email).trim().toLowerCase(), phone || null, subject || null, String(message).trim(),
  ]);
  res.status(201).json({ success: true, message: 'Message received. Our team will get back to you shortly.' });
});

/** POST /site/apply-instructor */
const applyInstructor = asyncHandler(async (req, res) => {
  const { name, email, phone, expertise, institute, message, apply_as } = req.body;
  if (!name || !isEmail(email || '')) throw ApiError.badRequest('Name and a valid email are required');
  await query(
    'INSERT INTO instructor_applications (user_id, name, email, phone, expertise, institute, apply_as, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user ? req.user.id : null, String(name).trim(), String(email).trim().toLowerCase(), phone || null, expertise || null, institute || null, apply_as === 'mentor' ? 'mentor' : 'instructor', message || null]
  );
  res.status(201).json({ success: true, message: 'Application submitted! We will review it and contact you by email.' });
});

/** GET /site/pages/:slug */
const page = asyncHandler(async (req, res) => {
  const row = await queryOne('SELECT slug, title, content, updated_at FROM pages WHERE slug = ?', [req.params.slug]);
  if (!row) throw ApiError.notFound('Page not found');
  res.json({ success: true, page: row });
});

/** GET /site/home - everything the home page needs in a single request */
const home = asyncHandler(async (_req, res) => {
  const instructors = await query(
    'SELECT id, name, slug, photo, designation, institute_name, featured_topic, promo_video FROM instructors WHERE is_featured = 1 ORDER BY sort_order, id'
  );
  const testimonialsRows = await query("SELECT id, name, image, description, designation, institute, rating FROM testimonials WHERE page = 'home' ORDER BY sequence, id LIMIT 6");
  const articles = await query(
    `SELECT a.id, a.title, a.slug, a.short_description, a.thumbnail, a.author_name, a.author_photo, a.read_time, a.no_of_view, a.published_date, ac.name AS category_name
     FROM articles a LEFT JOIN article_categories ac ON ac.id = a.category_id WHERE a.is_published = 1 ORDER BY a.published_date DESC, a.id DESC LIMIT 3`
  );
  const featuredBundle = await queryOne(
    'SELECT id, title, slug, short_description, thumbnail, banner, price, discount_price, is_discount FROM bundles WHERE is_active = 1 ORDER BY is_featured DESC, id ASC LIMIT 1'
  );
  const otherBundles = await query(
    'SELECT id, title, slug, short_description, thumbnail, price, discount_price, is_discount FROM bundles WHERE is_active = 1 AND id <> ? ORDER BY id ASC LIMIT 8',
    [featuredBundle ? featuredBundle.id : 0]
  );
  res.json({ success: true, instructors, testimonials: testimonialsRows, articles, featured_bundle: featuredBundle, bundles: otherBundles });
});

module.exports = { categories, settings, testimonials, newsletter, contact, applyInstructor, page, home };
