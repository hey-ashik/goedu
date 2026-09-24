const router = require('express').Router();
const c = require('../controllers/subscription.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/packages', c.packages);
router.get('/library', c.library);
router.get('/status', requireAuth, c.status);
router.post('/subscribe', requireAuth, c.subscribe);
router.post('/cancel', requireAuth, c.cancel);

module.exports = router;
