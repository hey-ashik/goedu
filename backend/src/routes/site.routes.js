const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/site.controller');

const formLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.get('/settings', c.settings);
router.get('/home', c.home);
router.get('/testimonials', c.testimonials);
router.get('/pages/:slug', c.page);
router.post('/newsletter', formLimiter, c.newsletter);
router.post('/contact', formLimiter, c.contact);
router.post('/apply-instructor', formLimiter, c.applyInstructor);

module.exports = router;
