const router = require('express').Router();
const c = require('../controllers/learning.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', c.myLearning);
router.get('/:slug', c.player);
router.post('/:slug/progress', c.progress);

module.exports = router;
