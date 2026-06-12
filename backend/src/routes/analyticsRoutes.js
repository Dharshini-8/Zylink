const express = require('express');
const router = express.Router();
const { getSummary, getUrlAnalytics, getPublicAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/url/:id', protect, getUrlAnalytics);
router.get('/public/:username/:code', getPublicAnalytics);

module.exports = router;
