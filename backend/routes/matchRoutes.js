const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get('/', authenticate, matchController.getMatches);
router.get('/search', authenticate, matchController.searchProfiles);
router.get('/city', authenticate, matchController.getCityMatches);
router.get('/explain', authenticate, matchController.getMatchExplain);

module.exports = router;
