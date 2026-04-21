const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const requestController = require('../controllers/requestController');

const router = express.Router();

router.post('/send', authenticate, requestController.sendRequest);
router.post('/pass', authenticate, requestController.passRequest);
router.post('/accept', authenticate, requestController.acceptRequest);
router.post('/reject', authenticate, requestController.rejectRequest);
router.get('/received', authenticate, requestController.receivedRequests);
router.get('/received/accepted', authenticate, requestController.receivedAcceptedRequests);
router.get('/sent', authenticate, requestController.sentRequests);

module.exports = router;
