const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// Only failed attempts count, so many learners behind one campus/office IP are not locked out together.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

router.post(
  '/register',
  authLimiter,
  validate({
    name: { required: true, min: 2, max: 150, label: 'Full name' },
    email: { required: true, email: true, label: 'Email' },
    password: { required: true, min: 6, max: 100, label: 'Password' },
  }),
  c.register
);
router.post('/login', authLimiter, validate({ email: { required: true, email: true }, password: { required: true } }), c.login);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
router.put('/profile', requireAuth, c.updateProfile);
router.put('/password', requireAuth, c.changePassword);

module.exports = router;
