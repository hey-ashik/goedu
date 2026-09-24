const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const groq = require('../services/groq.service');
const quota = require('../services/chatRateLimit.service');
const publicUrl = require('../utils/publicUrl');

const HISTORY_LIMIT = 12;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const VISITOR_COLS = 'id, name, email, phone, user_id, session_count, message_count, created_at, last_seen_at';

/** Public shape of a visitor row. */
const publicVisitor = (v) => (v ? { id: v.id, name: v.name, email: v.email, phone: v.phone, created_at: v.created_at, last_seen_at: v.last_seen_at } : null);

/**
 * Resolves who is chatting:
 *  - a logged in user is always known (name + email from the account, stored as a visitor too),
 *  - a guest is known once they filled the pre-chat form (visitor linked to their cookie key).
 */
async function currentVisitor(req) {
  const key = quota.userKey(req);
  if (req.user) {
    let v = await queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE user_id = ? LIMIT 1`, [req.user.id]);
    if (!v) v = await queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE email = ? LIMIT 1`, [req.user.email.toLowerCase()]);
    if (!v) {
      const r = await query(
        'INSERT INTO chat_visitors (name, email, phone, user_id, last_user_key, source) VALUES (?, ?, ?, ?, ?, ?)',
        [req.user.name, req.user.email.toLowerCase(), req.user.phone || null, req.user.id, key, 'account']
      );
      v = await queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE id = ?`, [r.insertId]);
    } else if (v.user_id !== req.user.id || v.last_user_key !== key) {
      await query('UPDATE chat_visitors SET user_id = ?, last_user_key = ?, name = COALESCE(name, ?) WHERE id = ?', [req.user.id, key, req.user.name, v.id]);
    }
    return v;
  }
  return queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE last_user_key = ? ORDER BY last_seen_at DESC LIMIT 1`, [key]);
}

/** Conversations belong to a visitor (any device) or, before identification, to the cookie / user key. */
function ownerClause(req, visitor) {
  const key = quota.userKey(req);
  if (visitor) return { sql: '(visitor_id = ? OR user_key = ?)', params: [visitor.id, key] };
  return { sql: 'user_key = ?', params: [key] };
}

async function getOrCreateConversation(req, visitor, conversationId) {
  const key = quota.userKey(req);
  const owner = ownerClause(req, visitor);
  if (conversationId) {
    const conv = await queryOne(`SELECT id, title, visitor_id FROM chat_conversations WHERE id = ? AND ${owner.sql}`, [conversationId, ...owner.params]);
    if (conv) {
      if (visitor && !conv.visitor_id) await query('UPDATE chat_conversations SET visitor_id = ? WHERE id = ?', [visitor.id, conv.id]);
      return conv;
    }
  }
  const r = await query('INSERT INTO chat_conversations (user_key, user_id, visitor_id) VALUES (?, ?, ?)', [key, req.user ? req.user.id : null, visitor ? visitor.id : null]);
  if (visitor) await query('UPDATE chat_visitors SET session_count = session_count + 1 WHERE id = ?', [visitor.id]);
  return { id: r.insertId, title: null, visitor_id: visitor ? visitor.id : null };
}

/** GET /chat/status - remaining quota + who the server thinks is chatting */
const status = asyncHandler(async (req, res) => {
  const [s, visitor] = await Promise.all([quota.getStatus(quota.userKey(req)), currentVisitor(req)]);
  res.json({ success: true, ...s, window_minutes: env.chat.windowMinutes, model: env.groq.model, visitor: publicVisitor(visitor), identified: !!visitor });
});

/**
 * POST /chat/identify { name, email, phone?, page_url? }
 * Pre-chat form: stores the visitor in MySQL (upsert by e-mail) and links it to
 * this browser so their history follows them.
 */
const identify = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim().slice(0, 150);
  const email = String(req.body.email || '').trim().toLowerCase().slice(0, 190);
  const phone = String(req.body.phone || '').trim().slice(0, 40) || null;
  const pageUrl = String(req.body.page_url || '').trim().slice(0, 500) || null;
  if (!email || !EMAIL_RE.test(email)) throw ApiError.badRequest('Please enter a valid e-mail address');

  const key = quota.userKey(req);
  const existing = await queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE email = ?`, [email]);
  let id;
  if (existing) {
    id = existing.id;
    await query(
      'UPDATE chat_visitors SET name = COALESCE(NULLIF(?, \'\'), name), phone = COALESCE(?, phone), user_id = COALESCE(?, user_id), last_user_key = ?, page_url = COALESCE(?, page_url), last_seen_at = NOW() WHERE id = ?',
      [name, phone, req.user ? req.user.id : null, key, pageUrl, id]
    );
  } else {
    const r = await query(
      'INSERT INTO chat_visitors (name, email, phone, user_id, last_user_key, source, page_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name || null, email, phone, req.user ? req.user.id : null, key, req.user ? 'account' : 'pre_chat_form', pageUrl]
    );
    id = r.insertId;
  }
  // claim the anonymous conversations of this browser for the visitor
  await query('UPDATE chat_conversations SET visitor_id = ? WHERE user_key = ? AND visitor_id IS NULL', [id, key]);
  const visitor = await queryOne(`SELECT ${VISITOR_COLS} FROM chat_visitors WHERE id = ?`, [id]);
  res.status(existing ? 200 : 201).json({ success: true, visitor: publicVisitor(visitor), returning: !!existing });
});

/** GET /chat/sessions - all conversations of this visitor (newest first) */
const sessions = asyncHandler(async (req, res) => {
  const visitor = await currentVisitor(req);
  const owner = ownerClause(req, visitor);
  const rows = await query(
    `SELECT id, title, message_count, created_at, updated_at FROM chat_conversations WHERE ${owner.sql} AND message_count > 0 ORDER BY updated_at DESC LIMIT 50`,
    owner.params
  );
  res.json({ success: true, sessions: rows });
});

/** GET /chat/history?conversation_id= - a conversation (default: the latest one) */
const history = asyncHandler(async (req, res) => {
  const visitor = await currentVisitor(req);
  const owner = ownerClause(req, visitor);
  let conv = null;
  if (req.query.conversation_id) {
    conv = await queryOne(`SELECT id, title, created_at FROM chat_conversations WHERE id = ? AND ${owner.sql}`, [req.query.conversation_id, ...owner.params]);
  }
  if (!conv) conv = await queryOne(`SELECT id, title, created_at FROM chat_conversations WHERE ${owner.sql} ORDER BY updated_at DESC LIMIT 1`, owner.params);
  if (!conv) return res.json({ success: true, conversation: null, messages: [], visitor: publicVisitor(visitor) });
  const messages = await query('SELECT id, role, content, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC LIMIT 200', [conv.id]);
  res.json({ success: true, conversation: conv, messages, visitor: publicVisitor(visitor) });
});

/** POST /chat/new - start a fresh conversation */
const newConversation = asyncHandler(async (req, res) => {
  const visitor = await currentVisitor(req);
  const conv = await getOrCreateConversation(req, visitor, null);
  res.status(201).json({ success: true, conversation: conv });
});

/**
 * POST /chat { message, conversation_id? }
 * Enforces the per-user quota (10 messages, then a 30 minute cool-down) BEFORE calling Groq.
 */
const send = asyncHandler(async (req, res) => {
  const message = String(req.body.message || '').trim();
  if (!message) throw ApiError.badRequest('Message is required');
  if (message.length > 2000) throw ApiError.badRequest('Message is too long (max 2000 characters)');

  const visitor = await currentVisitor(req);
  if (!visitor) throw ApiError.badRequest('Please enter your name and e-mail to start chatting', { code: 'IDENTITY_REQUIRED' });

  const key = quota.userKey(req);
  const gate = await quota.consume(key);
  if (!gate.allowed) {
    const mins = Math.ceil(gate.retry_after_seconds / 60);
    res.set('Retry-After', String(gate.retry_after_seconds));
    throw ApiError.tooMany(
      `You have used your ${gate.limit} AI Assistant messages. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
      { remaining: 0, limit: gate.limit, retry_after_seconds: gate.retry_after_seconds, reset_at: gate.reset_at }
    );
  }

  const conv = await getOrCreateConversation(req, visitor, req.body.conversation_id);
  const prior = await query('SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?', [conv.id, HISTORY_LIMIT]);
  const messages = [...prior.reverse().map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: message }];

  await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)', [conv.id, 'user', message]);
  if (!conv.title) await query('UPDATE chat_conversations SET title = ? WHERE id = ?', [message.slice(0, 120), conv.id]);

  let reply;
  try {
    reply = await groq.chatCompletion(messages, { user: req.user, visitor }, publicUrl(req));
  } catch (err) {
    // do not charge the quota for a failed upstream call
    await query('UPDATE chat_rate_limits SET message_count = GREATEST(message_count - 1, 0), blocked_until = NULL WHERE user_key = ?', [key]);
    if (err.name === 'AbortError') throw new ApiError(504, 'The AI Assistant took too long to respond. Please try again.');
    if (err.status === 503 || /rate limit/i.test(err.message || '')) {
      const wait = (err.message || '').match(/try again in ([\d.]+)s/i);
      throw new ApiError(503, `The AI Assistant is busy right now. Please try again in ${wait ? Math.ceil(Number(wait[1])) : 30} seconds.`);
    }
    throw new ApiError(err.status || 502, env.isProd ? 'AI service is temporarily unavailable. Please try again.' : err.message || 'AI service unavailable');
  }

  await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)', [conv.id, 'assistant', reply.content]);
  await query('UPDATE chat_conversations SET message_count = message_count + 2, updated_at = NOW() WHERE id = ?', [conv.id]);
  await query('UPDATE chat_visitors SET message_count = message_count + 1, last_seen_at = NOW() WHERE id = ?', [visitor.id]);

  res.json({
    success: true,
    conversation_id: conv.id,
    reply: reply.content,
    model: reply.model,
    quota: { limit: gate.limit, remaining: gate.remaining, reset_at: gate.reset_at, window_minutes: gate.window_minutes, limit_reached: gate.limit_reached },
  });
});

module.exports = { status, identify, sessions, history, newConversation, send };
