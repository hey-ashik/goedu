const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/courses', require('./course.routes'));
router.use('/categories', require('./category.routes'));
router.use('/bundles', require('./bundle.routes'));
router.use('/articles', require('./article.routes'));
router.use('/instructors', require('./instructor.routes'));
router.use('/mentorship', require('./mentorship.routes'));
router.use('/site', require('./site.routes'));
router.use('/subscription', require('./subscription.routes'));
router.use('/cart', require('./cart.routes'));
router.use('/wishlist', require('./wishlist.routes'));
router.use('/orders', require('./order.routes'));
router.use('/learning', require('./learning.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/payments', require('./payment.routes'));

module.exports = router;
