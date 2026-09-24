const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const c = require('../controllers/chat.controller');

// burst protection in addition to the per-user quota stored in MySQL
const burst = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.get('/status', c.status);
router.get('/history', c.history);
router.post('/new', c.newConversation);
router.post('/', burst, c.send);

module.exports = router;
