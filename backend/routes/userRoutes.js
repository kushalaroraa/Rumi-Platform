const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');

// GET current user's profile
router.get('/profile', authenticate, userController.getProfile);

// Update profile
router.put('/profile', authenticate, userController.updateProfile);

// Upload profile photo (multipart) - field name: photo
router.post('/profile/photo', authenticate, userController.uploadMiddleware, userController.uploadProfilePhotoHandler);

// Delete account
router.delete('/profile', authenticate, userController.deleteProfile);

module.exports = router;
