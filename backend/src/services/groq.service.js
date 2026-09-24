const env = require('../config/env');
const { query } = require('../config/db');

let catalogCache = { text: '', at: 0 };

/**
 * Compact catalogue snapshot injected into the system prompt so the AI Mentor
 * recommends real GoEdu courses (title | slug | category | level | price).
 */
async function catalogSnapshot() {
  if (Date.now() - catalogCache.at < 10 * 60 * 1000 && catalogCache.text) return catalogCache.text;
  const rows = await query(
    `SELECT c.title, c.slug, c.price, c.is_discount, c.discount_price, c.is_subscription, c.level_name, c.total_lesson, cat.title AS category
     FROM courses c LEFT JOIN categories cat ON cat.id = c.category_id
     WHERE c.status = 2 ORDER BY c.is_top_pick DESC, c.total_enroll DESC LIMIT 70`
  );
  // keep the prompt small: Groq free tier allows ~8k tokens per minute
  const lines = rows.map((r) => {
    const price = Number(r.price) === 0 ? 'Free' : r.is_discount && Number(r.discount_price) > 0 ? `৳${Number(r.discount_price)}` : `৳${Number(r.price)}`;
    return `${r.title} | ${r.slug} | ${r.category || 'General'} | ${r.level_name} | ${price}${r.is_subscription ? ' | Plus' : ''}`;
  });
  catalogCache = { text: lines.join('\n'), at: Date.now() };
  return catalogCache.text;
}

async function systemPrompt(user, appUrl) {
  const catalog = await catalogSnapshot();
  return `You are "GoEdu AI Mentor", the friendly learning advisor of GoEdu (https://goedu.ac), Bangladesh's GEAC-accredited online course platform with 280+ professional courses, course bundles, the Learner Plus subscription (Monthly ৳699 or Yearly ৳6,990 - includes a growing course library, AI Mentor access, priority support and 20% off other courses) and 1:1 mentorship sessions.

Your job:
- Understand the learner's goals, background and interests, then recommend the most relevant GoEdu courses (2-4 at a time) with a one-line reason for each. Always give the course link in the form ${env.appUrl}/courses/<slug> using ONLY slugs from the catalogue below.
- Suggest a simple step-by-step learning path when useful (beginner -> intermediate).
- Answer questions about certificates (shareable certificate on completion), pricing in Bangladeshi Taka (৳), the subscription, bundles, mentorship, refunds (no refunds on digital courses, see refund policy) and how to enrol (Buy Now / Free enrol / Learner Plus).
- Keep answers concise, warm and practical. Use short paragraphs or bullet points. Reply in the learner's language (English or Bangla).
- If something is outside GoEdu, say so briefly and steer back to learning. Never invent courses, prices or policies that are not in the catalogue.
${user ? `\nThe learner is logged in as ${user.name}.` : '\nThe learner is browsing as a guest; you may suggest creating a free account.'}

COURSE CATALOGUE (title | slug | category | level | price; "Plus" = included in Learner Plus). Link format: ${env.appUrl}/courses/<slug>
${catalog}`;
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint.
 * @param {Array<{role:string, content:string}>} messages conversation history (without system)
 */
async function chatCompletion(messages, user, appUrl = env.appUrl || 'https://goedu.ac') {
  if (!env.groq.apiKey) {
    const err = new Error('GROQ_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }
  const body = {
    model: env.groq.model,
    messages: [{ role: 'system', content: await systemPrompt(user, appUrl) }, ...messages],
    temperature: 0.6,
    max_tokens: 700,
    top_p: 1,
    stream: false,
  };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const resp = await fetch(env.groq.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.groq.apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      const err = new Error((data.error && data.error.message) || `Groq API error (${resp.status})`);
      err.status = resp.status === 429 ? 503 : 502;
      throw err;
    }
    const choice = data.choices && data.choices[0];
    const content = (choice && choice.message && choice.message.content) || '';
    return { content: content.trim(), usage: data.usage || null, model: data.model || env.groq.model };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { chatCompletion, catalogSnapshot };
