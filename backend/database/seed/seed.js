/* eslint-disable no-console */
/**
 * Seeds the GoEdu database with the catalogue data in ./data/*.json
 * (categories, courses + curriculum, instructors, bundles, blog articles,
 * testimonials, footer links, site settings, subscription plans, static pages)
 * plus a demo learner account.
 *
 *   npm run db:seed        (run `npm run db:migrate` first, or `npm run db:setup`)
 *
 * The seed is idempotent: it truncates the catalogue tables and re-inserts them.
 * User generated tables (users, orders, enrollments, chats...) are kept.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../../src/config/db');

const DATA = path.join(__dirname, 'data');
const load = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
const json = (v) => (v === undefined || v === null ? null : JSON.stringify(v));

async function insertMany(conn, table, columns, rows, chunk = 200) {
  if (!rows.length) return;
  for (let i = 0; i < rows.length; i += chunk) {
    const part = rows.slice(i, i + chunk);
    const placeholders = part.map(() => '(' + columns.map(() => '?').join(',') + ')').join(',');
    const values = part.flatMap((r) => columns.map((c) => (r[c] === undefined ? null : r[c])));
    await conn.query('INSERT INTO `' + table + '` (' + columns.map((c) => '`' + c + '`').join(',') + ') VALUES ' + placeholders, values);
  }
}

async function seed() {
  const conn = await pool.getConnection();
  try {
    console.log('[seed] clearing catalogue tables...');
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'course_lessons', 'course_sections', 'bundle_courses', 'bundles', 'courses', 'instructors', 'categories', 'languages',
      'article_comments', 'articles', 'article_categories', 'testimonials', 'footer_links', 'site_settings', 'pages', 'subscription_packages',
    ]) {
      await conn.query('TRUNCATE TABLE `' + t + '`');
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    // ---------- languages ----------
    await insertMany(conn, 'languages', ['id', 'name', 'flag', 'serial'], load('languages.json'));

    // ---------- categories (parents first) ----------
    const categories = load('categories.json');
    await insertMany(conn, 'categories', ['id', 'parent_id', 'title', 'slug', 'is_featured', 'sort_order'], categories.filter((c) => !c.parent_id));
    await insertMany(conn, 'categories', ['id', 'parent_id', 'title', 'slug', 'is_featured', 'sort_order'], categories.filter((c) => c.parent_id));
    console.log('[seed] categories:', categories.length);

    // ---------- instructors ----------
    const instructors = load('instructors.json').map((i) => ({
      ...i,
      is_featured: i.is_featured ? 1 : 0,
      is_mentor: i.is_mentor ? 1 : 0,
      mentor_rating: i.mentor_rating || 5,
      mentor_reviews: i.mentor_reviews || 0,
      session_minutes: i.session_minutes || 45,
      sort_order: i.sort_order || 0,
    }));
    await insertMany(conn, 'instructors', [
      'id', 'name', 'slug', 'email', 'photo', 'designation', 'institute_name', 'specialist', 'about', 'featured_topic', 'promo_video',
      'is_featured', 'is_mentor', 'mentor_category', 'mentor_rating', 'mentor_reviews', 'session_price', 'session_minutes', 'sort_order',
    ], instructors);
    console.log('[seed] instructors:', instructors.length);

    // ---------- courses + curriculum ----------
    const courses = load('courses.json');
    await insertMany(conn, 'courses', [
      'id', 'title', 'slug', 'category_id', 'language_id', 'owner_id', 'level', 'level_name', 'type', 'status', 'thumbnail', 'banner', 'promo_video',
      'meta_description', 'description', 'what_you_learn', 'price', 'is_discount', 'discount_price', 'discount_percent', 'is_free', 'is_subscription',
      'is_trending', 'is_top_pick', 'tags', 'keywords', 'total_enroll', 'avg_rating', 'total_rating', 'course_length', 'total_lesson', 'total_quiz',
      'total_assignment', 'shareable_certificate', 'full_online', 'flexible_schedule', 'created_at',
    ], courses.map((c) => ({ ...c, tags: json(c.tags || []), created_at: c.created_at || new Date() })));
    console.log('[seed] courses:', courses.length);

    let sectionId = 0; let lessonId = 0; const sections = []; const lessons = [];
    for (const c of courses) {
      (c.sections || []).forEach((s, si) => {
        sectionId += 1;
        sections.push({ id: sectionId, course_id: c.id, title: s.title, sort_order: si + 1 });
        (s.lessons || []).forEach((l, li) => {
          lessonId += 1;
          const lower = l.title.toLowerCase();
          const type = /quiz|mcq|test/.test(lower) ? 'quiz' : /assignment|project|task/.test(lower) ? 'assignment' : 'video';
          lessons.push({ id: lessonId, section_id: sectionId, course_id: c.id, title: l.title, type, duration_seconds: l.duration_seconds || 0, is_free_preview: l.is_free_preview ? 1 : 0, sort_order: li + 1 });
        });
      });
    }
    await insertMany(conn, 'course_sections', ['id', 'course_id', 'title', 'sort_order'], sections);
    await insertMany(conn, 'course_lessons', ['id', 'section_id', 'course_id', 'title', 'type', 'duration_seconds', 'is_free_preview', 'sort_order'], lessons);
    console.log('[seed] sections:', sections.length, 'lessons:', lessons.length);

    // ---------- bundles ----------
    const bundles = load('bundles.json');
    await insertMany(conn, 'bundles', [
      'id', 'title', 'slug', 'short_description', 'description', 'career_outcome', 'what_you_learn', 'thumbnail', 'banner', 'price', 'is_discount',
      'discount_price', 'is_featured', 'total_enroll',
    ], bundles.map((b) => ({ ...b, career_outcome: json(b.career_outcome), what_you_learn: json(b.what_you_learn) })));
    const slugToId = new Map(courses.map((c) => [c.slug, c.id]));
    const bundleCourses = [];
    for (const b of bundles) {
      (b.course_slugs || []).forEach((s, i) => { const id = slugToId.get(s); if (id) bundleCourses.push({ bundle_id: b.id, course_id: id, sort_order: i + 1 }); });
    }
    await insertMany(conn, 'bundle_courses', ['bundle_id', 'course_id', 'sort_order'], bundleCourses);
    console.log('[seed] bundles:', bundles.length, 'bundle courses:', bundleCourses.length);

    // ---------- articles ----------
    await insertMany(conn, 'article_categories', ['id', 'name', 'slug'], load('article_categories.json'));
    const articles = load('articles.json');
    await insertMany(conn, 'articles', [
      'title', 'slug', 'category_id', 'short_description', 'body', 'thumbnail', 'banner', 'author_name', 'author_photo', 'author_bio', 'tags',
      'read_time', 'no_of_view', 'is_featured', 'published_date',
    ], articles.map((a) => ({ ...a, tags: json(a.tags || []) })));
    console.log('[seed] articles:', articles.length);

    // ---------- testimonials / footer / settings / packages ----------
    await insertMany(conn, 'testimonials', ['name', 'image', 'description', 'designation', 'institute', 'rating', 'sequence', 'page'], load('testimonials.json'));
    await insertMany(conn, 'footer_links', ['title', 'link', 'position_name', 'position', 'sort_order', 'is_published'], load('footer_links.json'));
    const settings = load('site_settings.json');
    await insertMany(conn, 'site_settings', ['setting_key', 'setting_value'], Object.entries(settings).map(([k, v]) => ({ setting_key: k, setting_value: String(v) })));
    await insertMany(conn, 'subscription_packages', [
      'id', 'title', 'package_choice', 'duration', 'price', 'is_discount', 'discount_price', 'save_amount', 'save_percentage', 'perks',
    ], load('subscription_packages.json').map((p) => ({ ...p, perks: json(p.perks || []) })));

    // ---------- static pages ----------
    const pages = load('pages.json');
    await insertMany(conn, 'pages', ['slug', 'title', 'content'], pages);
    console.log('[seed] pages:', pages.length);

    // ---------- demo learner ----------
    const [existing] = await conn.query('SELECT id FROM users WHERE email = ?', ['demo@goedu.ac']);
    if (!existing.length) {
      const hash = await bcrypt.hash('Demo@1234', 10);
      await conn.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', ['Demo Learner', 'demo@goedu.ac', hash, 'learner']);
      console.log('[seed] demo user: demo@goedu.ac / Demo@1234');
    }

    console.log('[seed] done.');
  } finally {
    conn.release();
    await pool.end();
  }
}

if (require.main === module) {
  seed().catch((err) => {
    console.error('[seed] failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
