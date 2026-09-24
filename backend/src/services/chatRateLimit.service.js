const { query, queryOne } = require('../config/db');
const env = require('../config/env');

/**
 * Per-user chatbot quota (stored in MySQL so it survives restarts and works
 * across multiple server instances):
 *
 *   - each user (logged in) or guest (cookie id) may send CHAT_LIMIT messages,
 *   - after the limit is reached they are blocked for CHAT_WINDOW_MINUTES,
 *   - an idle window (no message for CHAT_WINDOW_MINUTES) also resets the counter.
 */
const LIMIT = env.chat.limit;
const WINDOW_MS = env.chat.windowMinutes * 60 * 1000;

function userKey(req) {
  return req.user ? `user:${req.user.id}` : `guest:${req.guestId}`;
}

async function getStatus(key) {
  const row = await queryOne('SELECT message_count, window_started_at, blocked_until FROM chat_rate_limits WHERE user_key = ?', [key]);
  const now = Date.now();
  if (!row) return { remaining: LIMIT, limit: LIMIT, blocked: false, retry_after_seconds: 0, reset_at: null };
  const blockedUntil = row.blocked_until ? new Date(row.blocked_until).getTime() : 0;
  if (blockedUntil > now) {
    return { remaining: 0, limit: LIMIT, blocked: true, retry_after_seconds: Math.ceil((blockedUntil - now) / 1000), reset_at: new Date(blockedUntil).toISOString() };
  }
  const windowStart = new Date(row.window_started_at).getTime();
  if (blockedUntil && blockedUntil <= now) return { remaining: LIMIT, limit: LIMIT, blocked: false, retry_after_seconds: 0, reset_at: null };
  if (now - windowStart > WINDOW_MS) return { remaining: LIMIT, limit: LIMIT, blocked: false, retry_after_seconds: 0, reset_at: null };
  return { remaining: Math.max(0, LIMIT - row.message_count), limit: LIMIT, blocked: false, retry_after_seconds: 0, reset_at: new Date(windowStart + WINDOW_MS).toISOString() };
}

/**
 * Consumes one message from the quota. Returns { allowed, ...status }.
 */
async function consume(key) {
  const status = await getStatus(key);
  if (status.blocked) return { allowed: false, ...status };
  const row = await queryOne('SELECT message_count, window_started_at, blocked_until FROM chat_rate_limits WHERE user_key = ?', [key]);
  const now = new Date();
  const fresh = !row || status.remaining === LIMIT;
  let count = fresh ? 1 : row.message_count + 1;
  let blockedUntil = null;
  if (count >= LIMIT) blockedUntil = new Date(now.getTime() + WINDOW_MS);
  if (!row) {
    await query('INSERT INTO chat_rate_limits (user_key, message_count, window_started_at, blocked_until) VALUES (?, ?, ?, ?)', [key, count, now, blockedUntil]);
  } else if (fresh) {
    await query('UPDATE chat_rate_limits SET message_count = ?, window_started_at = ?, blocked_until = ? WHERE user_key = ?', [count, now, blockedUntil, key]);
  } else {
    await query('UPDATE chat_rate_limits SET message_count = ?, blocked_until = ? WHERE user_key = ?', [count, blockedUntil, key]);
  }
  return {
    allowed: true,
    limit: LIMIT,
    remaining: Math.max(0, LIMIT - count),
    blocked: false,
    retry_after_seconds: 0,
    reset_at: blockedUntil ? blockedUntil.toISOString() : null,
    limit_reached: count >= LIMIT,
    window_minutes: env.chat.windowMinutes,
  };
}

module.exports = { userKey, getStatus, consume, LIMIT, WINDOW_MS };
