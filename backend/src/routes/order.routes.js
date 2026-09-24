const router = require('express').Router();
const c = require('../controllers/order.controller');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);
router.get('/', c.list);
router.post('/checkout', c.checkout);
router.post('/enroll-free', c.enrollFree);

module.exports = router;
