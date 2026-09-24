/** Joins class names, skipping falsy values. */
export const cn = (...args) => args.flat().filter(Boolean).join(' ');

/** "৳1,200" style price. */
export const formatPrice = (n) => {
  const v = Number(n || 0);
  return v.toLocaleString('en-US', { maximumFractionDigits: v % 1 ? 2 : 0 });
};

export const formatDate = (d, opts = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString('en-US', opts);
};

export const formatDateTime = (d) =>
  formatDate(d, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

export const initials = (name = '') =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join('') || 'G';

export const truncate = (s = '', n = 120) => (s.length > n ? s.slice(0, n).trim() + '…' : s);

/** Strips HTML tags for previews. */
export const stripHtml = (html = '') => String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

/** Resolves an image path from the API; falls back to the placeholder. */
export const img = (src, fallback = '/placeholder.svg') => {
  if (!src) return fallback;
  return src;
};

/** seconds -> "2 : 37" as on goedu.ac lesson rows */
export const lessonTime = (seconds = 0) => {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m} : ${String(s).padStart(2, '0')}`;
};

/** seconds -> "2 hr 35min" */
export const totalLength = (seconds = 0) => {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} hr ${mins % 60}min`;
};

export const compactNumber = (n = 0) => {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

/** Minimal markdown -> HTML for chatbot replies (bold, links, lists, code, line breaks). */
export const miniMarkdown = (text = '') => {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = esc(text).split(/\r?\n/);
  let html = '';
  let list = null;
  const flush = () => { if (list) { html += `</${list}>`; list = null; } };
  const inline = (s) =>
    s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*(?!\*)([^*\n]+?)\*(?!\*)/g, '$1$2') // *italic* -> plain text (chat bubbles stay clean)
      .replace(/(^|[^*])\*(?!\*)/g, '$1') // stray single asterisks
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/(^|[^"'>])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    const ul = line.match(/^\s*[-*•]\s+(.*)/);
    const ol = line.match(/^\s*\d+[.)]\s+(.*)/);
    const h = line.match(/^\s*#{1,4}\s+(.*)/);
    if (ul) { if (list !== 'ul') { flush(); list = 'ul'; html += '<ul>'; } html += `<li>${inline(ul[1])}</li>`; continue; }
    if (ol) { if (list !== 'ol') { flush(); list = 'ol'; html += '<ol>'; } html += `<li>${inline(ol[1])}</li>`; continue; }
    flush();
    if (!line.trim()) continue;
    if (h) { html += `<p><strong>${inline(h[1])}</strong></p>`; continue; }
    html += `<p>${inline(line)}</p>`;
  }
  flush();
  return html;
};
