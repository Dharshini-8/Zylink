const express = require('express');
const router = express.Router();
const { redirectToUrl } = require('../controllers/redirectController');

router.get('/:username/:code', redirectToUrl);

module.exports = router;
