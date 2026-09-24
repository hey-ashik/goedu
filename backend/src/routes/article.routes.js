const router = require('express').Router();
const c = require('../controllers/article.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', c.list);
router.get('/categories', c.categories);
router.get('/trending', c.trending);
router.get('/:slug', c.detail);
router.post('/:slug/comments', requireAuth, c.comment);

module.exports = router;
