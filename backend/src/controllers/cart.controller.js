const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { activeSubscription } = require('./subscription.controller');

const ownerClause = (req) => (req.user ? { sql: 'ci.user_id = ?', param: req.user.id } : { sql: 'ci.guest_id = ?', param: req.guestId });

async function loadCart(req) {
  const owner = ownerClause(req);
  const rows = await query(
    `SELECT ci.id, ci.course_id, ci.bundle_id, ci.created_at,
            c.title AS course_title, c.slug AS course_slug, c.thumbnail AS course_thumb, c.price AS course_price, c.is_discount, c.discount_price, c.is_subscription,
            i.name AS instructor_name,
            b.title AS bundle_title, b.slug AS bundle_slug, b.thumbnail AS bundle_thumb, b.price AS bundle_price, b.is_discount AS b_is_discount, b.discount_price AS b_discount_price
     FROM cart_items ci
     LEFT JOIN courses c ON c.id = ci.course_id
     LEFT JOIN instructors i ON i.id = c.owner_id
     LEFT JOIN bundles b ON b.id = ci.bundle_id
     WHERE ${owner.sql} ORDER BY ci.created_at DESC`,
    [owner.param]
  );
  const sub = req.user ? await activeSubscription(req.user.id) : null;
  const benefit = sub ? 20 : 0;
  const items = rows.map((r) => {
    if (r.bundle_id) {
      const price = Number(r.bundle_price);
      const after = r.b_is_discount && Number(r.b_discount_price) > 0 ? Number(r.b_discount_price) : price;
      return { id: r.id, type: 'bundle', bundle_id: r.bundle_id, title: r.bundle_title, slug: r.bundle_slug, thumbnail: r.bundle_thumb, price, after_discount_price: after };
    }
    const price = Number(r.course_price);
    let after = r.is_discount && Number(r.discount_price) > 0 ? Number(r.discount_price) : price;
    if (benefit && !r.is_discount && price > 0) after = Math.round(price * (1 - benefit / 100));
    return { id: r.id, type: 'course', course_id: r.course_id, title: r.course_title, slug: r.course_slug, thumbnail: r.course_thumb, instructor: r.instructor_name, price, after_discount_price: after, is_subscription: !!r.is_subscription };
  });
  const subtotal = items.reduce((n, i) => n + i.price, 0);
  const total = items.reduce((n, i) => n + i.after_discount_price, 0);
  return { items, count: items.length, subtotal, discount: subtotal - total, total, subscription_benefit: benefit };
}

/** GET /cart */
const get = asyncHandler(async (req, res) => res.json({ success: true, cart: await loadCart(req) }));

/** POST /cart { course_id | bundle_id } */
const add = asyncHandler(async (req, res) => {
  const { course_id, bundle_id } = req.body;
  if (!course_id && !bundle_id) throw ApiError.badRequest('course_id or bundle_id is required');
  const owner = ownerClause(req);
  if (course_id) {
    const course = await queryOne('SELECT id, price FROM courses WHERE id = ? AND status = 2', [course_id]);
    if (!course) throw ApiError.notFound('Course not found');
    if (req.user) {
      const enrolled = await queryOne('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?', [req.user.id, course.id]);
      if (enrolled) throw ApiError.conflict('You are already enrolled in this course');
    }
    const dup = await queryOne(`SELECT id FROM cart_items ci WHERE ${owner.sql} AND ci.course_id = ?`, [owner.param, course.id]);
    if (!dup) await query('INSERT INTO cart_items (user_id, guest_id, course_id) VALUES (?, ?, ?)', [req.user ? req.user.id : null, req.user ? null : req.guestId, course.id]);
  } else {
    const bundle = await queryOne('SELECT id FROM bundles WHERE id = ? AND is_active = 1', [bundle_id]);
    if (!bundle) throw ApiError.notFound('Bundle not found');
    const dup = await queryOne(`SELECT id FROM cart_items ci WHERE ${owner.sql} AND ci.bundle_id = ?`, [owner.param, bundle.id]);
    if (!dup) await query('INSERT INTO cart_items (user_id, guest_id, bundle_id) VALUES (?, ?, ?)', [req.user ? req.user.id : null, req.user ? null : req.guestId, bundle.id]);
  }
  res.status(201).json({ success: true, message: 'Added to cart', cart: await loadCart(req) });
});

/** DELETE /cart/:id */
const remove = asyncHandler(async (req, res) => {
  const owner = ownerClause(req);
  await query(`DELETE ci FROM cart_items ci WHERE ci.id = ? AND ${owner.sql}`, [req.params.id, owner.param]);
  res.json({ success: true, cart: await loadCart(req) });
});

/** DELETE /cart */
const clear = asyncHandler(async (req, res) => {
  const owner = ownerClause(req);
  await query(`DELETE ci FROM cart_items ci WHERE ${owner.sql}`, [owner.param]);
  res.json({ success: true, cart: await loadCart(req) });
});

module.exports = { get, add, remove, clear, loadCart };
