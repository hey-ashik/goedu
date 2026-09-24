const crypto = require('crypto');

const COOKIE = 'goedu_gid';
const ONE_YEAR = 365 * 24 * 60 * 60 * 1000;

/**
 * Gives every visitor a stable anonymous id (cookie) so guest carts and the
 * chatbot rate limit can be tracked per visitor even before login.
 */
module.exports = function guestId(req, res, next) {
  let gid = req.cookies && req.cookies[COOKIE];
  if (!gid || !/^[a-f0-9-]{36}$/.test(gid)) {
    gid = crypto.randomUUID();
    res.cookie(COOKIE, gid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ONE_YEAR,
    });
  }
  req.guestId = gid;
  next();
};
