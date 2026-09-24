const safeJson = (v, fallback = null) => {
  if (v === null || v === undefined) return fallback;
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return fallback; }
};

const toBool = (v) => v === 1 || v === true || v === '1' || v === 'true';

/** Human readable duration from seconds, e.g. "3.5 Hours" or "45 mins" */
const formatDuration = (seconds) => {
  if (!seconds) return '--';
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} mins`;
  const hrs = (mins / 60).toFixed(1).replace(/\.0$/, '');
  return `${hrs} Hours`;
};

const paginate = (req, defaults = { page: 1, pageSize: 12, max: 100 }) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || defaults.page);
  const pageSize = Math.min(defaults.max, Math.max(1, parseInt(req.query.page_size, 10) || defaults.pageSize));
  return { page, pageSize, offset: (page - 1) * pageSize };
};

const paged = (results, count, page, pageSize) => ({
  count,
  page,
  page_size: pageSize,
  total_pages: Math.max(1, Math.ceil(count / pageSize)),
  next: page * pageSize < count ? page + 1 : null,
  previous: page > 1 ? page - 1 : null,
  results,
});

module.exports = { safeJson, toBool, formatDuration, paginate, paged };
