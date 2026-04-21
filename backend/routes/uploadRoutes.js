const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const uploadController = require('../controllers/uploadController');

// Generic Cloudinary Upload (Authenticated)
router.post('/cloudinary', authenticate, uploadController.uploadMiddleware, uploadController.uploadImage);

// Specific Cloudinary Profile Photo Update (Authenticated)
router.post('/profile-photo', authenticate, uploadController.uploadMiddleware, uploadController.updateProfilePhoto);

module.exports = router;
