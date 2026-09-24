const router = require('express').Router();
const c = require('../controllers/instructor.controller');

router.get('/', c.list);
router.get('/:slug', c.detail);

module.exports = router;
