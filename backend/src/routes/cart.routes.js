const router = require('express').Router();
const c = require('../controllers/cart.controller');

router.get('/', c.get);
router.post('/', c.add);
router.delete('/:id', c.remove);
router.delete('/', c.clear);

module.exports = router;
