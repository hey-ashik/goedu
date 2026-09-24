const env = require('../config/env');

/** Public site origin: APP_URL when configured, otherwise derived from the incoming request. */
module.exports = function publicUrl(req) {
  if (env.appUrl) return env.appUrl;
  const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
  return `${proto.split(',')[0]}://${req.get('host')}`;
};
