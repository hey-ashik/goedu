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

async function systemPrompt(who, appUrl) {
  const catalog = await catalogSnapshot();
  const user = who && who.user;
  const visitor = who && who.visitor;
  const learnerName = (user && user.name) || (visitor && visitor.name) || '';
  return `You are "GoEdu AI Assistant", the friendly learning advisor of GoEdu (https://goedu.ac), Bangladesh's GEAC-accredited online course platform with 280+ professional courses, course bundles, the Learner Plus subscription (Monthly ৳699 or Yearly ৳6,990 - includes a growing course library, AI Mentor access, priority support and 20% off other courses) and 1:1 mentorship sessions.

Your job:
- Understand the learner's goals, background and interests, then recommend the most relevant GoEdu courses (2-4 at a time) with a one-line reason for each. Always give the course link in the form ${appUrl}/courses/<slug> using ONLY slugs from the catalogue below.
- Suggest a simple step-by-step learning path when useful (beginner -> intermediate).
- Answer questions about certificates (shareable certificate on completion), pricing in Bangladeshi Taka (৳), the subscription, bundles, mentorship, refunds (no refunds on digital courses, see refund policy) and how to enrol (Buy Now / Free enrol / Learner Plus).
- If something is outside GoEdu, say so briefly and steer back to learning. Never invent courses, prices or policies that are not in the catalogue.

How you write (very important - you are a real support advisor at GoEdu, not a chatbot):
- Sound like a warm, experienced human advisor typing in a chat window. Natural sentences, direct answers, no filler openers like "Great question!", "Certainly!", "Absolutely!", "As an AI" or "I hope this helps".
- Keep it short: usually 2-6 sentences, or a short list when comparing options. One idea per sentence. Reply in the learner's language (English or Bangla).
- Formatting is limited to what a chat bubble can show: **bold** only for course names, prices and the one key point; "- " bullets for lists; numbered steps for a learning path. Nothing else.
- Never use headings (#), tables, horizontal rules, italics with single asterisks, code blocks, emojis or decorative symbols. Never leave stray * characters in the text.
- Write course links as plain URLs on their own or inside a sentence, never as [text](url) markdown.
- Ask one short follow-up question when the learner's goal is unclear instead of guessing.
${user ? `\nThe learner is logged in as ${user.name}${user.email ? ` (${user.email})` : ''}. Address them by name.` : learnerName ? `\nThe learner introduced themselves in the chat form as ${learnerName}${visitor && visitor.email ? ` (${visitor.email})` : ''} but is not logged in. Address them by name and you may suggest creating a free account.` : '\nThe learner is browsing as a guest; you may suggest creating a free account.'}

COURSE CATALOGUE (title | slug | category | level | price; "Plus" = included in Learner Plus). Link format: ${env.appUrl}/courses/<slug>
${catalog}`;
}

/**
 * Turns whatever markdown the model produced into clean chat text:
 * bold (**...**) and "- " bullets survive, everything else (headings, tables,
 * rules, italics, code fences, markdown links, stray asterisks) is removed so the
 * bubble reads like a person typed it.
 */
function cleanReply(text = '') {
  let t = String(text).replace(/\r\n/g, '\n');
  t = t.replace(/```[a-z]*\n?([\s\S]*?)```/g, '$1'); // code fences -> plain text
  t = t.replace(/^[ \t]{0,3}#{1,6}[ \t]*(.+?)[ \t]*#*[ \t]*$/gm, '**$1**'); // headings -> bold line
  t = t.replace(/^[ \t]*([-*_][ \t]*){3,}[ \t]*$/gm, ''); // horizontal rules
  t = t.replace(/^[ \t]*\|?.*\|.*\n[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(\|[ \t]*:?-{2,}:?[ \t]*)*\|?[ \t]*$/gm, ''); // table header + separator rows
  t = t.replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_m, row) => '- ' + row.split('|').map((c) => c.trim()).filter(Boolean).join(': ')); // table rows -> bullets
  t = t.replace(/^[ \t]*(Great question|Good question|Certainly|Absolutely|Sure thing|Sure|Of course|Definitely)[!.,:]+[ \t]*/gim, ''); // chatbot filler openers
  t = t.replace(/[ \t]{2,}/g, ' ');
  t = t.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label, url) => (label.trim() === url ? url : `${label} ${url}`)); // [text](url) -> text url
  t = t.replace(/^(\s*)[•*]\s+/gm, '$1- '); // * / • bullets -> "- "
  t = t.replace(/(^|[^*])\*(?!\*)([^*\n]+?)\*(?!\*)/g, '$1$2'); // *italic* -> plain
  t = t.replace(/(^|[^_\w])_([^_\n]+?)_(?!\w)/g, '$1$2'); // _italic_ -> plain
  t = t.replace(/\*\*\s*\*\*/g, ''); // empty bold
  t = t.replace(/(^|[^*])\*(?!\*)(?=[^*]|$)/gm, '$1'); // any leftover single asterisk
  t = t.replace(/`([^`\n]+)`/g, '$1'); // inline code -> plain
  t = t.replace(/[ \t]{2,}/g, ' ').replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n');
  return t.trim();
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint.
 * @param {Array<{role:string, content:string}>} messages conversation history (without system)
 * @param {{user?:object, visitor?:object}} who logged in user and/or identified visitor
 */
async function chatCompletion(messages, who, appUrl = env.appUrl || 'https://goedu.ac') {
  if (!env.groq.apiKey) {
    const err = new Error('GROQ_API_KEY is not configured on the server');
    err.status = 503;
    throw err;
  }
  const body = {
    model: env.groq.model,
    messages: [{ role: 'system', content: await systemPrompt(who, appUrl) }, ...messages],
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
    return { content: cleanReply(content), usage: data.usage || null, model: data.model || env.groq.model };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { chatCompletion, catalogSnapshot, cleanReply };
