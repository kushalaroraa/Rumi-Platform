const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fs = require('fs');

const SALT_ROUNDS = 10;

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
      'lifestylePreferences', 'roommatePreferences', 'verificationStatus', 'location',
      'profilePicture', 'profileCompleted', 'intent'
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.lifestylePreferences && typeof updates.lifestylePreferences === 'object') {
      const lp = { ...updates.lifestylePreferences };
      if (!lp.cleanliness && lp.cleanlinessLevel) {
        lp.cleanliness = lp.cleanlinessLevel;
      }
      updates.lifestylePreferences = {
        smoking: lp.smoking ?? 'no',
        petsAllowed: Boolean(lp.petsAllowed),
        sleepSchedule: lp.sleepSchedule ?? 'flexible',
        foodPreference: lp.foodPreference ?? 'veg',
        cleanliness: lp.cleanliness ?? 'medium',
      };
    }

    if (updates.roommatePreferences && typeof updates.roommatePreferences === 'object') {
      const rp = updates.roommatePreferences;
      const rawMin = rp.ageMin !== '' && rp.ageMin != null ? Number(rp.ageMin) : 18;
      const rawMax = rp.ageMax !== '' && rp.ageMax != null ? Number(rp.ageMax) : 60;
      if (!Number.isFinite(rawMin) || !Number.isFinite(rawMax) || rawMin < 18 || rawMax > 120) {
        return res.status(400).json({ success: false, message: 'Preferred roommate age must be between 18 and 120.' });
      }
      if (rawMin > rawMax) {
        return res.status(400).json({ success: false, message: 'Minimum preferred age cannot exceed maximum preferred age.' });
      }
      updates.roommatePreferences = {
        preferredGender: ['male', 'female', 'non_binary', 'other', 'any', ''].includes(rp.preferredGender)
          ? rp.preferredGender
          : 'any',
        ageMin: rawMin,
        ageMax: rawMax,
        petsPreference: ['allowed', 'not_allowed', 'any', ''].includes(rp.petsPreference)
          ? rp.petsPreference
          : 'any',
      };
    }

    if (updates.budgetRange === undefined && req.body?.budget !== undefined && req.body?.budget !== '') {
      const legacyVal = Number(req.body.budget);
      if (!Number.isFinite(legacyVal) || legacyVal < 0) {
        return res.status(400).json({ success: false, message: 'Budget value must be a valid positive number.' });
      }
      updates.budgetRange = { min: legacyVal, max: legacyVal };
    }

    if (updates.budgetRange && typeof updates.budgetRange === 'object') {
      const minB = Number(updates.budgetRange.min ?? 0);
      const maxB = Number(updates.budgetRange.max ?? 0);
      if (!Number.isFinite(minB) || !Number.isFinite(maxB) || minB < 0 || maxB < 0) {
        return res.status(400).json({ success: false, message: 'Budget range values must be valid positive numbers.' });
      }
      const hasBudgetValues = minB > 0 || maxB > 0;
      if (hasBudgetValues) {
        if ((minB > 0 && (minB < 5000 || minB > 100000)) || (maxB > 0 && (maxB < 5000 || maxB > 100000))) {
          return res.status(400).json({ success: false, message: 'Monthly budget must be between ₹5,000 and ₹1,00,000.' });
        }
        if (minB > 0 && maxB > 0 && minB > maxB) {
          return res.status(400).json({ success: false, message: 'Minimum budget cannot exceed maximum budget.' });
        }
      }
      updates.budgetRange = {
        min: minB,
        max: maxB,
      };
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
    const user = await User.findByIdAndDelete(req.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.json({ success: true, message: 'Account deleted.' });
  } catch (err) {
    console.error('deleteProfile error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

// Change password (authenticated user)
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password, new password, and confirmation are required.',
      });
    }

    if (String(newPassword) !== String(confirmPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation do not match.',
      });
    }

    const passwordStr = String(newPassword);
    if (passwordStr.length < 8 || !/[A-Za-z]/.test(passwordStr) || !/\d/.test(passwordStr)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters and include at least one letter and one number.',
      });
    }

    if (passwordStr === String(currentPassword)) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from your current password.',
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (!user.passwordHash) {
      return res.status(400).json({ success: false, message: 'Password change is not available for this account.' });
    }

    const matches = await bcrypt.compare(String(currentPassword), user.passwordHash);
    if (!matches) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.passwordHash = await bcrypt.hash(passwordStr, SALT_ROUNDS);
    await user.save();

    return res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('changePassword error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports.deleteProfile = deleteProfile;
module.exports.changePassword = changePassword;
