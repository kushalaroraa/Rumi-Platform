const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer disk storage (saves to disk temporarily for path-based upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

/**
 * Generic upload controller (used for non-profile images if needed)
 */
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Use cloudinary.uploader.upload with file.path as requested
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'rumi_uploads'
    });
    
    // Cleanup local file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(200).json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Cleanup local file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Headless Upload Controller - Returns Cloudinary URL without updating User DB
 * (User DB is updated separately in the final profile submission)
 */
const updateProfilePhoto = async (req, res) => {
  let tempFilePath = req.file?.path;
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No photo provided for upload.' });
    }

    console.log('Headless upload starting for:', tempFilePath);

    // Optimized path-based upload with transformations
    const result = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'rumi_profiles',
      transformation: [
        { width: 500, height: 500, crop: "limit", quality: "auto" }
      ]
    });
    
    // Strict validation of Cloudinary response
    if (!result?.secure_url) {
      throw new Error('Cloudinary failed to return a valid secure_url');
    }

    // Async cleanup of local temp file
    if (tempFilePath) {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Cleanup error:', err);
      });
    }

    console.log('Headless upload success:', result.secure_url);

    return res.json({
      success: true,
      message: 'Image uploaded to cloud successfully',
      url: result.secure_url,
      secure_url: result.secure_url
    });
  } catch (error) {
    console.error('Image upload error:', error);
    // Async cleanup on error as well
    if (tempFilePath) {
      fs.unlink(tempFilePath, () => {});
    }
    return res.status(500).json({ success: false, message: error.message || 'Upload failed' });
  }
};

module.exports = {
  uploadImage,
  updateProfilePhoto,
  uploadMiddleware: upload.single('photo') // Changed field name to 'photo'
};
