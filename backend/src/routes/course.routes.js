const router = require('express').Router();
const c = require('../controllers/course.controller');

router.get('/', c.list);
router.get('/search', c.search);
router.get('/popular', c.popular);
router.get('/top-picks', c.topPicks);
router.get('/:slug', c.detail);
router.get('/:slug/related', c.related);

module.exports = router;
