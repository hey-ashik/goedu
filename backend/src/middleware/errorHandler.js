const env = require('../config/env');

function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route ' + req.method + ' ' + req.originalUrl + ' not found' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  const status = err.status || (err.code === 'ER_DUP_ENTRY' ? 409 : 500);
  const message =
    status === 500 && env.isProd ? 'Something went wrong. Please try again.' : err.message || 'Server error';
  if (status >= 500) console.error('[API ERROR]', err);
  res.status(status).json({
    success: false,
    message,
    ...(err.details ? { details: err.details } : {}),
    ...(!env.isProd && status >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = { notFound, errorHandler };
