/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const db = require('../../src/config/db');

/**
 * Keeps the mentor flags of the instructors table in step with seed/data/instructors.json.
 * The full seed only runs on an empty database, so an already deployed site would keep
 * stale mentors forever; this runs on every boot and only touches the mentor columns.
 * Idempotent and cheap (one UPDATE per instructor that differs).
 */
async function syncMentors() {
  const file = path.join(__dirname, 'data', 'instructors.json');
  const seed = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = await db.query('SELECT id, slug, is_mentor, mentor_category, session_price, session_minutes, mentor_rating, mentor_reviews, sort_order FROM instructors');
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  let updated = 0;
  for (const i of seed) {
    const row = bySlug.get(i.slug);
    if (!row) continue;
    const want = {
      is_mentor: i.is_mentor ? 1 : 0,
      mentor_category: i.is_mentor ? i.mentor_category || null : null,
      session_price: i.is_mentor && i.session_price != null ? Number(i.session_price) : null,
      session_minutes: i.is_mentor ? i.session_minutes || 45 : 45,
      mentor_rating: i.is_mentor ? i.mentor_rating || 5 : 5,
      mentor_reviews: i.is_mentor ? i.mentor_reviews || 0 : 0,
      sort_order: i.sort_order || 0,
    };
    const same =
      Number(row.is_mentor) === want.is_mentor &&
      (row.mentor_category || null) === want.mentor_category &&
      (row.session_price == null ? null : Number(row.session_price)) === want.session_price &&
      Number(row.session_minutes) === want.session_minutes &&
      Number(row.mentor_rating) === want.mentor_rating &&
      Number(row.mentor_reviews) === want.mentor_reviews &&
      Number(row.sort_order) === want.sort_order;
    if (same) continue;
    await db.query(
      'UPDATE instructors SET is_mentor = ?, mentor_category = ?, session_price = ?, session_minutes = ?, mentor_rating = ?, mentor_reviews = ?, sort_order = ? WHERE id = ?',
      [want.is_mentor, want.mentor_category, want.session_price, want.session_minutes, want.mentor_rating, want.mentor_reviews, want.sort_order, row.id]
    );
    updated++;
  }
  const [{ n }] = await db.query('SELECT COUNT(*) AS n FROM instructors WHERE is_mentor = 1');
  console.log(`[seed] mentors synced: ${updated} updated, ${n} mentor(s) live`);
  return { updated, mentors: Number(n) };
}

if (require.main === module) {
  syncMentors().then(() => process.exit(0)).catch((err) => { console.error('[seed] mentor sync failed:', err.message); process.exit(1); });
}

module.exports = syncMentors;
