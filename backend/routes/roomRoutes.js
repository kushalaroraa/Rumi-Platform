const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { authenticate } = require('../middleware/authMiddleware');

/**
 * GET /api/rooms/recommended
 * Fetch recommended rooms for the seeker dashboard
 */
router.get('/recommended', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const rooms = await Room.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ success: true, rooms });
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
