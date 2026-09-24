const router = require('express').Router();
const c = require('../controllers/bundle.controller');

router.get('/', c.list);
router.get('/:slug', c.detail);

module.exports = router;
