const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/chat.controller');

// burst protection in addition to the per-user quota stored in MySQL
const burst = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
const identifyBurst = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false });

router.get('/status', c.status);
router.post('/identify', identifyBurst, c.identify);
router.get('/sessions', c.sessions);
router.get('/history', c.history);
router.post('/new', c.newConversation);
router.post('/', burst, c.send);

module.exports = router;
