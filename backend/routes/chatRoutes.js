const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { getChatHistory, getChatThreads } = require('../controllers/chatController');

const router = express.Router();

router.get('/history', authenticate, getChatHistory);
router.get('/threads', authenticate, getChatThreads);

module.exports = router;
