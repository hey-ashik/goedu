const router = require('express').Router();
const c = require('../controllers/order.controller');

// SSLCommerz redirects the customer's browser here (POST) after the hosted checkout
router.post('/sslcommerz/success', c.sslSuccess);
router.get('/sslcommerz/success', c.sslSuccess);
router.post('/sslcommerz/fail', c.sslFail);
router.get('/sslcommerz/fail', c.sslFail);
router.post('/sslcommerz/cancel', c.sslCancel);
router.get('/sslcommerz/cancel', c.sslCancel);
router.post('/sslcommerz/ipn', c.sslIpn);

module.exports = router;
