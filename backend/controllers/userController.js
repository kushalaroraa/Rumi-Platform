const path = require('path');
const multer = require('multer');
const User = require('../models/User');
const { Notification } = require('../models/Notification');
const fs = require('fs');

// Local Multer storage for profile photos is deprecated in favor of Cloudinary (see uploadController.js)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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
      'intent', 'notificationSettings', 'privacySettings', 'securitySettings'
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
 * Obsolete handler - Profile photos now handled via Cloudinary headless uploader
 */
async function uploadProfilePhotoHandler(req, res) {
  return res.status(410).json({ success: false, message: 'This endpoint is deprecated. Use Cloudinary upload.' });
}

module.exports = {
  getProfile,
  updateProfile,
  uploadMiddleware: (req, res, next) => next(), // No-op middleware since we moved to uploadController
  uploadProfilePhotoHandler
};

// Delete profile (account removal)
async function deleteProfile(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    console.error('deleteProfile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports.deleteProfile = deleteProfile;

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (String(newPassword).length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const bcrypt = require('bcryptjs');
    const isGoogleAccount = user.authProvider === 'google' && user.googleId;
    const hasPassword = Boolean(user.passwordHash);

    if (!isGoogleAccount && !hasPassword) {
      return res.status(400).json({ success: false, message: 'This account does not have a password set yet.' });
    }

    if (!isGoogleAccount || hasPassword) {
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
      }
      const matches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!matches) {
        return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
      }
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    try {
      await Notification.create({
        userId: user._id,
        type: 'security',
        title: 'Password changed',
        message: 'Your account password was updated successfully.',
        read: false,
        meta: { source: 'settings' }
      });
    } catch (notificationErr) {
      console.warn('password change notification failed:', notificationErr);
    }

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports.changePassword = changePassword;
