const router = require('express').Router();
const c = require('../controllers/instructor.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/mentors', c.mentors);
router.get('/categories', c.mentorCategories);
router.get('/mentors/:slug', c.mentorDetail);
router.get('/bookings', requireAuth, c.myBookings);
router.post('/bookings', requireAuth, c.book);

module.exports = router;
