const { query, queryOne } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const groq = require('../services/groq.service');
const quota = require('../services/chatRateLimit.service');

const HISTORY_LIMIT = 12;

async function getOrCreateConversation(req, conversationId) {
  const key = quota.userKey(req);
  if (conversationId) {
    const conv = await queryOne('SELECT id, title FROM chat_conversations WHERE id = ? AND user_key = ?', [conversationId, key]);
    if (conv) return conv;
  }
  const r = await query('INSERT INTO chat_conversations (user_key, user_id) VALUES (?, ?)', [key, req.user ? req.user.id : null]);
  return { id: r.insertId, title: null };
}

/** GET /chat/status - remaining quota for this visitor */
const status = asyncHandler(async (req, res) => {
  const s = await quota.getStatus(quota.userKey(req));
  res.json({ success: true, ...s, window_minutes: env.chat.windowMinutes, model: env.groq.model });
});

/** GET /chat/history?conversation_id= - latest conversation for this visitor */
const history = asyncHandler(async (req, res) => {
  const key = quota.userKey(req);
  let conv = null;
  if (req.query.conversation_id) conv = await queryOne('SELECT id, title, created_at FROM chat_conversations WHERE id = ? AND user_key = ?', [req.query.conversation_id, key]);
  if (!conv) conv = await queryOne('SELECT id, title, created_at FROM chat_conversations WHERE user_key = ? ORDER BY updated_at DESC LIMIT 1', [key]);
  if (!conv) return res.json({ success: true, conversation: null, messages: [] });
  const messages = await query('SELECT id, role, content, created_at FROM chat_messages WHERE conversation_id = ? ORDER BY id ASC LIMIT 100', [conv.id]);
  res.json({ success: true, conversation: conv, messages });
});

/** POST /chat/new - start a fresh conversation */
const newConversation = asyncHandler(async (req, res) => {
  const conv = await getOrCreateConversation(req, null);
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

  const key = quota.userKey(req);
  const gate = await quota.consume(key);
  if (!gate.allowed) {
    const mins = Math.ceil(gate.retry_after_seconds / 60);
    res.set('Retry-After', String(gate.retry_after_seconds));
    throw ApiError.tooMany(
      `You have used your ${gate.limit} AI Mentor messages. Please try again in ${mins} minute${mins === 1 ? '' : 's'}.`,
      { remaining: 0, limit: gate.limit, retry_after_seconds: gate.retry_after_seconds, reset_at: gate.reset_at }
    );
  }

  const conv = await getOrCreateConversation(req, req.body.conversation_id);
  const prior = await query('SELECT role, content FROM chat_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ?', [conv.id, HISTORY_LIMIT]);
  const messages = [...prior.reverse().map((m) => ({ role: m.role, content: m.content })), { role: 'user', content: message }];

  await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)', [conv.id, 'user', message]);
  if (!conv.title) await query('UPDATE chat_conversations SET title = ? WHERE id = ?', [message.slice(0, 120), conv.id]);

  let reply;
  try {
    reply = await groq.chatCompletion(messages, req.user, require('../utils/publicUrl')(req));
  } catch (err) {
    // do not charge the quota for a failed upstream call
    await query('UPDATE chat_rate_limits SET message_count = GREATEST(message_count - 1, 0), blocked_until = NULL WHERE user_key = ?', [key]);
    if (err.name === 'AbortError') throw new ApiError(504, 'The AI Mentor took too long to respond. Please try again.');
    if (err.status === 503 || /rate limit/i.test(err.message || '')) {
      const wait = (err.message || '').match(/try again in ([\d.]+)s/i);
      throw new ApiError(503, `The AI Mentor is busy right now. Please try again in ${wait ? Math.ceil(Number(wait[1])) : 30} seconds.`);
    }
    throw new ApiError(err.status || 502, env.isProd ? 'AI service is temporarily unavailable. Please try again.' : err.message || 'AI service unavailable');
  }

  await query('INSERT INTO chat_messages (conversation_id, role, content) VALUES (?, ?, ?)', [conv.id, 'assistant', reply.content]);
  await query('UPDATE chat_conversations SET updated_at = NOW() WHERE id = ?', [conv.id]);

  res.json({
    success: true,
    conversation_id: conv.id,
    reply: reply.content,
    model: reply.model,
    quota: { limit: gate.limit, remaining: gate.remaining, reset_at: gate.reset_at, window_minutes: gate.window_minutes, limit_reached: gate.limit_reached },
  });
});

module.exports = { status, history, newConversation, send };
