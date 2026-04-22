const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Room = require('../models/Room');
const User = require('../models/User');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');
const { calculateRoomCompatibility } = require('../services/roomMatchingService');
const { Request } = require('../models/Request');

const roomUploadsDir = path.join(__dirname, '..', 'uploads', 'rooms');
if (!fs.existsSync(roomUploadsDir)) {
  fs.mkdirSync(roomUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, roomUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '');
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || '').toLowerCase();
    if (mime.startsWith('image/') || mime.startsWith('video/')) return cb(null, true);
    return cb(new Error('Only image/video files are allowed.'));
  }
});

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(value) {
  return String(value).toLowerCase() === 'true';
}

function oneOf(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

function getImagePaths(files) {
  const photos = files?.photos || [];
  return photos.map((f) => `/uploads/rooms/${path.basename(f.path)}`);
}

/**
 * GET /api/rooms/recommended
 * Fetch recommended rooms for the seeker dashboard
 */
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const rooms = await Room.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit * 2); // Fetch more to allow for sorting

    let enrichedRooms = rooms.map(room => room.toObject());

    if (req.user) {
      // Calculate scores if user is logged in
      enrichedRooms = enrichedRooms.map(room => {
        const score = calculateRoomCompatibility(room, req.user);
        return {
          ...room,
          compatibility: score,
          matchScore: score
        };
      });
      // Sort by compatibility
      enrichedRooms.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
    } else {
      // Default placeholder scores for unauthenticated view
      enrichedRooms = enrichedRooms.map(room => ({
        ...room,
        compatibility: 0
      }));
    }

    res.json({ 
      success: true, 
      rooms: enrichedRooms.slice(0, limit) 
    });
  } catch (err) {
    console.error('getRecommendedRooms error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/rooms/mine
 * Fetch rooms owned by the current user
 */
router.get('/mine', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({ ownerUserId: req.userId });
    res.json({ success: true, rooms });
  } catch (err) {
    console.error('getMyRooms error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /api/rooms
 * Create a new room listing (Offer a Room flow)
 */
router.post(
  '/',
  authenticate,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const propertyType = String(req.body?.propertyType || '').trim();
      const roomType = String(req.body?.roomType || '').trim();
      const city = String(req.body?.city || req.user?.city || req.user?.location?.city || '').trim();

      if (!propertyType || !roomType || !city) {
        return res.status(400).json({
          success: false,
          message: 'propertyType, roomType and city are required.'
        });
      }

      const photoUrls = getImagePaths(req.files);
      const amenities = [];
      if (toBool(req.body?.wifi)) amenities.push('wifi');
      if (toBool(req.body?.ac)) amenities.push('ac');
      if (toBool(req.body?.washingMachine)) amenities.push('washing_machine');
      if (toBool(req.body?.kitchenAccess)) amenities.push('kitchen_access');
      if (toBool(req.body?.parking)) amenities.push('parking');
      if (toBool(req.body?.powerBackup)) amenities.push('power_backup');
      if (toBool(req.body?.attachedBathroom)) amenities.push('attached_bathroom');
      if (req.body?.furnishingStatus) amenities.push(`furnishing:${String(req.body.furnishingStatus)}`);

      const flatmatePreferences = {
        ageMin: toNumber(req.body?.ageMin, 18),
        ageMax: toNumber(req.body?.ageMax, 100),
        preferredGender: oneOf(String(req.body?.preferredGender || 'any'), ['male', 'female', 'any', ''], 'any'),
        occupation: oneOf(String(req.body?.occupation || 'any'), ['student', 'working', 'any', ''], 'any'),
        smokingAllowed: oneOf(String(req.body?.smokingAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any'),
        drinkingAllowed: oneOf(String(req.body?.drinkingAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any'),
        petsAllowed: oneOf(String(req.body?.petsAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any'),
        cleanlinessLevel: oneOf(String(req.body?.cleanlinessLevel || 'any'), ['low', 'medium', 'high', 'any', ''], 'any'),
        sleepSchedule: oneOf(String(req.body?.sleepSchedule || 'any'), ['early_sleeper', 'night_owl', 'any', ''], 'any'),
        foodPreference: oneOf(String(req.body?.foodPreference || 'any'), ['veg', 'non-veg', 'any', ''], 'any')
      };

      const room = await Room.create({
        ownerUserId: req.userId,
        propertyType,
        roomType,
        monthlyRent: toNumber(req.body?.monthlyRent, 0),
        location: {
          area: String(req.body?.area || '').trim(),
          city,
          address: String(req.body?.address || '').trim(),
          state: String(req.body?.state || '').trim(),
          pincode: String(req.body?.pincode || '').trim()
        },
        photoUrls,
        coverUrl: photoUrls[0] || '',
        roomDescription: String(req.body?.roomDescription || '').trim(),
        amenities,
        rules: [],
        flatmatePreferences,
        status: 'active'
      });

      return res.status(201).json({ success: true, room });
    } catch (err) {
      console.error('createRoom error:', err);
      return res.status(500).json({ success: false, message: err.message || 'Server error' });
    }
  }
);

/**
 * POST /api/rooms/:roomId/view
 */
router.post('/:roomId/view', authenticate, async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.roomId,
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
    );
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    return res.json({ success: true, viewsCount: room.viewsCount });
  } catch (err) {
    console.error('incrementRoomView error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * GET /api/rooms/:roomId/suggestions
 */
router.get('/:roomId/suggestions', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    if (String(room.ownerUserId) !== String(req.userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 25);
    const existingRequests = await Request.find({ roomId: room._id }).select('toUserId').lean();
    const requestedUserIds = new Set(existingRequests.map((r) => String(r.toUserId)));

    const users = await User.find({
      _id: { $ne: req.userId },
      profileCompleted: true,
      intent: { $ne: 'offer' }
    }).select('-passwordHash').lean();

    const suggestions = users
      .filter((u) => !requestedUserIds.has(String(u._id)))
      .map((u) => {
        const score = calculateRoomCompatibility(room, u);
        return {
          userId: u._id,
          name: u.name,
          age: u.age,
          city: u.city || u.location?.city || '',
          image: u.photo || u.profilePicture || '',
          score,
          matchScore: score,
          budgetRange: u.budgetRange || {}
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error('getRoomSuggestions error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PATCH /api/rooms/:roomId/status
 */
router.patch('/:roomId/status', authenticate, async (req, res) => {
  try {
    const status = String(req.body?.status || '').trim();
    if (!['active', 'paused', 'rented'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const room = await Room.findOneAndUpdate(
      { _id: req.params.roomId, ownerUserId: req.userId },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    return res.json({ success: true, room });
  } catch (err) {
    console.error('updateRoomStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * PUT /api/rooms/:roomId
 */
router.put(
  '/:roomId',
  authenticate,
  upload.fields([
    { name: 'photos', maxCount: 10 },
    { name: 'video', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const room = await Room.findOne({ _id: req.params.roomId, ownerUserId: req.userId });
      if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

      const photoUrls = getImagePaths(req.files);
      if (photoUrls.length > 0) {
        room.photoUrls = photoUrls;
        room.coverUrl = photoUrls[0];
      }

      if (req.body?.propertyType != null) room.propertyType = String(req.body.propertyType);
      if (req.body?.roomType != null) room.roomType = String(req.body.roomType);
      if (req.body?.monthlyRent != null) room.monthlyRent = toNumber(req.body.monthlyRent, room.monthlyRent);
      if (req.body?.roomDescription != null) room.roomDescription = String(req.body.roomDescription);

      room.location = {
        ...room.location,
        area: req.body?.area != null ? String(req.body.area) : room.location?.area,
        city: req.body?.city != null ? String(req.body.city) : room.location?.city,
        address: req.body?.address != null ? String(req.body.address) : room.location?.address,
        state: req.body?.state != null ? String(req.body.state) : room.location?.state,
        pincode: req.body?.pincode != null ? String(req.body.pincode) : room.location?.pincode
      };

      await room.save();
      return res.json({ success: true, room });
    } catch (err) {
      console.error('updateRoom error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * DELETE /api/rooms/:roomId
 */
router.delete('/:roomId', authenticate, async (req, res) => {
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.roomId, ownerUserId: req.userId });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });
    return res.json({ success: true, message: 'Room deleted.' });
  } catch (err) {
    console.error('deleteRoom error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
