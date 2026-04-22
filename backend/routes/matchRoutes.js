const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get('/', authenticate, matchController.getMatches);
router.get('/explain', authenticate, matchController.getMatchExplain);

module.exports = router;
