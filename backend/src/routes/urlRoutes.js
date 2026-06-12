const express = require('express');
const router = express.Router();
const { createUrl, getUrls, getUrl, updateUrl, deleteUrl, bulkShorten } = require('../controllers/urlController');
const { protect } = require('../middlewares/authMiddleware');

// All routes here require auth protection
router.use(protect);

router.post('/', createUrl);
router.get('/', getUrls);
router.post('/bulk', bulkShorten);
router.get('/:id', getUrl);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
