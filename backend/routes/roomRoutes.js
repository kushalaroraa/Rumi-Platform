const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const User = require('../models/User');
const { optionalAuth, authenticate } = require('../middleware/authMiddleware');
const { calculateRoomCompatibility } = require('../services/roomMatchingService');

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

module.exports = router;
