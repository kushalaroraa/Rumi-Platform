const path = require('path');
const multer = require('multer');
const User = require('../models/User');

// Configured multer storage to save uploads to backend/uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
const fs = require('fs');

// Ensuring uploads dir exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = Date.now() + '-' + Math.round(Math.random() * 1e9); // Generates a unique filename
    cb(null, base + ext);
  }
});

const upload = multer({ storage });

/**
 * GET /user/profile
 */
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: user.toObject() });
  } catch (err) {
    console.error('getProfile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

/**
 * PUT /user/profile
 */
async function updateProfile(req, res) {
  try {
    const allowed = [
      'name', 'age', 'gender', 'city', 'profession', 'budgetRange', 'bio', 'photo',
      'lifestylePreferences', 'verificationStatus', 'location', 'profilePicture', 'profileCompleted',
      'intent'
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.name !== undefined) {
      const nameStr = String(updates.name).trim();
      const parts = nameStr ? nameStr.split(/\s+/).filter(Boolean) : [];
      if (!nameStr || parts.length < 2) {
        return res.status(400).json({ success: false, message: 'Full name must include at least first name and last name.' });
      }
      updates.name = nameStr;
    }

    if (updates.age !== undefined) {
      const ageNum = Number(updates.age);
      if (!Number.isFinite(ageNum) || ageNum < 18 || ageNum > 120) {
        return res.status(400).json({ success: false, message: 'Age must be between 18 and 120.' });
      }
      updates.age = ageNum;
    }

  //returns updated user and still checks validators
  const user = await User.findByIdAndUpdate(req.userId, { $set: updates }, { returnDocument: 'after', runValidators: true }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: user.toObject() }); //toObject() is used to convert the Mongoose document to a plain JS object
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

/**
 * POST /user/profile/photo
 */
async function uploadProfilePhotoHandler(req, res) {
  try {
    if (!req.file || !req.file.filename) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const photoPath = '/uploads/' + req.file.filename;
 
  const user = await User.findByIdAndUpdate(req.userId, { $set: { photo: photoPath, profilePicture: photoPath } }, { returnDocument: 'after' }).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, user: user.toObject() });
  } catch (err) {
    console.error('uploadProfilePhoto error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  uploadMiddleware: upload.single('photo'),
  uploadProfilePhotoHandler
};

// Delete profile (account removal)
async function deleteProfile(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    console.error('deleteProfile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports.deleteProfile = deleteProfile;
