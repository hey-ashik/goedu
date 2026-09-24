const router = require('express').Router();
const c = require('../controllers/site.controller');

router.get('/', c.categories);

module.exports = router;
