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

function normalizeCityText(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * GET /api/rooms/recommended
 * Fetch recommended rooms for the seeker dashboard
 */
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const selectedCity = String(req.query?.city || '').trim();
    const selectedCityNorm = normalizeCityText(selectedCity);
    const filterByLocation = String(req.query?.filterByLocation || '').toLowerCase() === 'true';

    const filter = { status: 'active' };
    const interactionByRoomId = new Map();

    if (req.user) {
      filter.ownerUserId = { $ne: req.userId };

      const [outgoingRoomReqs, incomingAcceptedRoomReqs] = await Promise.all([
        Request.find({
          fromUserId: req.userId,
          roomId: { $ne: null }
        }).select('roomId status').lean(),
        Request.find({
          toUserId: req.userId,
          roomId: { $ne: null },
          status: 'accepted'
        }).select('roomId status').lean()
      ]);

      const passedRoomIds = [];
      for (const item of outgoingRoomReqs) {
        const rid = String(item.roomId);
        if (item.status === 'rejected') {
          passedRoomIds.push(item.roomId);
        } else if (item.status === 'accepted') {
          interactionByRoomId.set(rid, 'accepted');
        } else if (item.status === 'pending' && !interactionByRoomReqsHasAccepted(interactionByRoomId, rid)) {
          interactionByRoomId.set(rid, 'pending');
        }
      }
      for (const item of incomingAcceptedRoomReqs) {
        interactionByRoomId.set(String(item.roomId), 'accepted');
      }

      if (passedRoomIds.length > 0) {
        filter._id = { $nin: passedRoomIds };
      }
    }

    const rooms = await Room.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.max(limit * 4, 100));

    const cityDisplayMap = new Map();
    for (const room of rooms) {
      const cRaw = String(room?.location?.city || '').trim();
      const cNorm = normalizeCityText(cRaw);
      if (cNorm && !cityDisplayMap.has(cNorm)) {
        cityDisplayMap.set(cNorm, cRaw);
      }
    }
    const availableCities = Array.from(cityDisplayMap.values()).sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' })
    );

    let enrichedRooms = rooms.map(room => room.toObject());

    if (req.user) {
      // Calculate scores if user is logged in
      enrichedRooms = enrichedRooms.map(room => {
        const score = calculateRoomCompatibility(room, req.user);
        return {
          ...room,
          compatibility: score,
          matchScore: score,
          userInteractionStatus: interactionByRoomId.get(String(room._id)) || null
        };
      });
    } else {
      // Default placeholder scores for unauthenticated view
      enrichedRooms = enrichedRooms.map(room => ({
        ...room,
        compatibility: 0,
        userInteractionStatus: null
      }));
    }

    if (filterByLocation && selectedCityNorm) {
      enrichedRooms.sort((a, b) => {
        const aInCity = normalizeCityText(a?.location?.city) === selectedCityNorm ? 1 : 0;
        const bInCity = normalizeCityText(b?.location?.city) === selectedCityNorm ? 1 : 0;
        if (bInCity !== aInCity) return bInCity - aInCity;
        return (b.compatibility || 0) - (a.compatibility || 0);
      });
    } else {
      enrichedRooms.sort((a, b) => (b.compatibility || 0) - (a.compatibility || 0));
    }

    res.json({ 
      success: true, 
      availableCities,
      rooms: enrichedRooms.slice(0, limit) 
    });
  } catch (err) {
    console.error('getRecommendedRooms error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

function interactionByRoomReqsHasAccepted(map, rid) {
  return map.get(rid) === 'accepted';
}

/**
 * GET /api/rooms/mine
 * Fetch rooms owned by the current user
 */
router.get('/mine', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({ ownerUserId: req.userId }).sort({ createdAt: -1 }).lean();
    if (rooms.length === 0) {
      return res.json({ success: true, rooms: [] });
    }
    const roomIds = rooms.map((r) => r._id);
    const pendingCounts = await Request.aggregate([
      { $match: { roomId: { $in: roomIds }, toUserId: req.userId, status: 'pending' } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } }
    ]);
    const totalCounts = await Request.aggregate([
      { $match: { roomId: { $in: roomIds }, toUserId: req.userId } },
      { $group: { _id: '$roomId', count: { $sum: 1 } } }
    ]);
    const pendingMap = new Map(pendingCounts.map((c) => [String(c._id), c.count]));
    const totalMap = new Map(totalCounts.map((c) => [String(c._id), c.count]));

    const enriched = rooms.map((r) => ({
      ...r,
      incomingRequestsCount: pendingMap.get(String(r._id)) ?? 0,
      totalRequests: r.totalRequests || totalMap.get(String(r._id)) || 0,
    }));

    res.json({ success: true, rooms: enriched });
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

      const monthlyRent = Number(req.body?.monthlyRent);
      if (!Number.isFinite(monthlyRent) || monthlyRent < 5000 || monthlyRent > 100000) {
        return res.status(400).json({
          success: false,
          message: 'Monthly rent must be between ₹5,000 and ₹1,00,000.'
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
    const existingRequests = await Request.find({ roomId: room._id })
      .select('toUserId fromUserId status')
      .lean();
    const interactedUserIds = new Set();
    for (const r of existingRequests) {
      if (r.toUserId) interactedUserIds.add(String(r.toUserId));
      if (r.fromUserId) interactedUserIds.add(String(r.fromUserId));
    }

    const users = await User.find({
      _id: { $ne: req.userId },
      profileCompleted: true,
      intent: { $ne: 'offer' }
    }).select('-passwordHash -otpCode -otpExpiresAt').lean();

    const suggestions = users
      .filter((u) => !interactedUserIds.has(String(u._id)))
      .map((u) => {
        const score = calculateRoomCompatibility(room, u);
        return {
          userId: u._id,
          name: u.name,
          age: u.age,
          gender: u.gender || '',
          profession: u.profession || '',
          city: u.city || u.location?.city || '',
          bio: u.bio || '',
          image: u.photo || u.profilePicture || '',
          score,
          matchScore: score,
          compatibility: score,
          budgetRange: u.budgetRange || (u.budget != null ? { min: Number(u.budget) || 0, max: Number(u.budget) || 0 } : {}),
          lifestylePreferences: u.lifestylePreferences || {},
          roommatePreferences: u.roommatePreferences || {}
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

      if (req.body?.propertyType != null) room.propertyType = String(req.body.propertyType).trim();
      if (req.body?.roomType != null) room.roomType = String(req.body.roomType).trim();
      if (req.body?.monthlyRent !== undefined && req.body?.monthlyRent !== '') {
        const nextRent = Number(req.body.monthlyRent);
        if (!Number.isFinite(nextRent) || nextRent < 5000 || nextRent > 100000) {
          return res.status(400).json({
            success: false,
            message: 'Monthly rent must be between ₹5,000 and ₹1,00,000.'
          });
        }
        room.monthlyRent = nextRent;
      }
      if (req.body?.roomDescription != null) room.roomDescription = String(req.body.roomDescription).trim();
      if (req.body?.status != null && ['active', 'paused', 'rented'].includes(String(req.body.status))) {
        room.status = String(req.body.status);
      }

      room.location = {
        ...room.location,
        area: req.body?.area != null ? String(req.body.area).trim() : room.location?.area,
        city: req.body?.city != null ? String(req.body.city).trim() : room.location?.city,
        address: req.body?.address != null ? String(req.body.address).trim() : room.location?.address,
        state: req.body?.state != null ? String(req.body.state).trim() : room.location?.state,
        pincode: req.body?.pincode != null ? String(req.body.pincode).trim() : room.location?.pincode
      };

      const hasAmenityFields = ['wifi', 'ac', 'washingMachine', 'kitchenAccess', 'parking', 'powerBackup', 'attachedBathroom', 'furnishingStatus']
        .some((k) => req.body?.[k] !== undefined);
      if (hasAmenityFields) {
        const nextAmenities = [];
        if (toBool(req.body?.wifi)) nextAmenities.push('wifi');
        if (toBool(req.body?.ac)) nextAmenities.push('ac');
        if (toBool(req.body?.washingMachine)) nextAmenities.push('washing_machine');
        if (toBool(req.body?.kitchenAccess)) nextAmenities.push('kitchen_access');
        if (toBool(req.body?.parking)) nextAmenities.push('parking');
        if (toBool(req.body?.powerBackup)) nextAmenities.push('power_backup');
        if (toBool(req.body?.attachedBathroom)) nextAmenities.push('attached_bathroom');
        if (req.body?.furnishingStatus) nextAmenities.push(`furnishing:${String(req.body.furnishingStatus)}`);
        room.amenities = nextAmenities;
      } else if (req.body?.amenities !== undefined) {
        try {
          const parsedAmenities = Array.isArray(req.body.amenities)
            ? req.body.amenities
            : JSON.parse(String(req.body.amenities));
          if (Array.isArray(parsedAmenities)) {
            room.amenities = parsedAmenities.map((x) => String(x).trim()).filter(Boolean);
          }
        } catch {
          // ignore invalid JSON
        }
      }

      if (req.body?.rules !== undefined) {
        if (Array.isArray(req.body.rules)) {
          room.rules = req.body.rules.map((x) => String(x).trim()).filter(Boolean);
        } else {
          const rawRules = String(req.body.rules || '').trim();
          if (rawRules.startsWith('[')) {
            try {
              const parsedRules = JSON.parse(rawRules);
              if (Array.isArray(parsedRules)) {
                room.rules = parsedRules.map((x) => String(x).trim()).filter(Boolean);
              }
            } catch {
              room.rules = rawRules.split(/\n+/).map((x) => x.trim()).filter(Boolean);
            }
          } else {
            room.rules = rawRules ? rawRules.split(/\n+/).map((x) => x.trim()).filter(Boolean) : [];
          }
        }
      }

      const prefKeys = ['ageMin', 'ageMax', 'preferredGender', 'occupation', 'smokingAllowed', 'drinkingAllowed', 'petsAllowed', 'cleanlinessLevel', 'sleepSchedule', 'foodPreference'];
      if (prefKeys.some((k) => req.body?.[k] !== undefined)) {
        const cur = room.flatmatePreferences || {};
        room.flatmatePreferences = {
          ageMin: req.body?.ageMin !== undefined ? toNumber(req.body.ageMin, cur.ageMin ?? 18) : (cur.ageMin ?? 18),
          ageMax: req.body?.ageMax !== undefined ? toNumber(req.body.ageMax, cur.ageMax ?? 100) : (cur.ageMax ?? 100),
          preferredGender: req.body?.preferredGender !== undefined
            ? oneOf(String(req.body.preferredGender || 'any'), ['male', 'female', 'any', ''], 'any')
            : (cur.preferredGender || 'any'),
          occupation: req.body?.occupation !== undefined
            ? oneOf(String(req.body.occupation || 'any'), ['student', 'working', 'any', ''], 'any')
            : (cur.occupation || 'any'),
          smokingAllowed: req.body?.smokingAllowed !== undefined
            ? oneOf(String(req.body.smokingAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any')
            : (cur.smokingAllowed || 'any'),
          drinkingAllowed: req.body?.drinkingAllowed !== undefined
            ? oneOf(String(req.body.drinkingAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any')
            : (cur.drinkingAllowed || 'any'),
          petsAllowed: req.body?.petsAllowed !== undefined
            ? oneOf(String(req.body.petsAllowed || 'any'), ['allowed', 'not_allowed', 'any', ''], 'any')
            : (cur.petsAllowed || 'any'),
          cleanlinessLevel: req.body?.cleanlinessLevel !== undefined
            ? oneOf(String(req.body.cleanlinessLevel || 'any'), ['low', 'medium', 'high', 'any', ''], 'any')
            : (cur.cleanlinessLevel || 'any'),
          sleepSchedule: req.body?.sleepSchedule !== undefined
            ? oneOf(String(req.body.sleepSchedule || 'any'), ['early_sleeper', 'night_owl', 'any', ''], 'any')
            : (cur.sleepSchedule || 'any'),
          foodPreference: req.body?.foodPreference !== undefined
            ? oneOf(String(req.body.foodPreference || 'any'), ['veg', 'non-veg', 'any', ''], 'any')
            : (cur.foodPreference || 'any')
        };
      }

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
