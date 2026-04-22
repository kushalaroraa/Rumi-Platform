const { Request } = require('../models/Request');
const User = require('../models/User');
const { calculateMatch } = require('../services/matchingService');
const Room = require('../models/Room');
const { calculateRoomCompatibility } = require('../services/roomMatchingService');
const { Notification } = require('../models/Notification');

async function createNotification(userId, type, title, message, meta = {}) {
    try {
        await Notification.create({
            userId,
            type,
            title,
            message,
            read: false,
            meta,
        });
    } catch (e) {
        console.error('createNotification error:', e);
    }
}

/**
 * POST /api/request/send
 * Body: { toUserId, roomId }
 */
async function sendRequest(req, res) {
    try {
        const fromUserId = req.userId;
        const { toUserId, roomId } = req.body || {};
        if (!toUserId) {
            return res.status(400).json({ success: false, message: 'toUserId required.' });
        }
        if (fromUserId.toString() === toUserId.toString()) {
            return res.status(400).json({ success: false, message: 'Cannot send request to yourself.' });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        let room = null;
        const roomIdStr = roomId ? String(roomId) : null;
        if (roomIdStr) {
            room = await Room.findById(roomIdStr);
            if (!room) return res.status(404).json({ success: false, message: 'Room not found.' });

            const ownerId = room.ownerUserId?.toString?.();

            // For room-scoped requests, sender and recipient must be between seeker and room owner.
            const allowedPair =
                (ownerId === fromUserId.toString() && toUserId.toString() !== fromUserId.toString()) ||
                (ownerId === toUserId.toString() && fromUserId.toString() !== toUserId.toString());

            if (!allowedPair) {
                return res.status(403).json({ success: false, message: 'Room request must involve the room owner.' });
            }
        }
        if ((toUser.blockedUsers || []).some(id => id.toString() === fromUserId.toString())) {
            return res.status(403).json({ success: false, message: 'Cannot send request.' });
        }

        const existing = await Request.findOne({
            fromUserId,
            toUserId,
            roomId: roomIdStr || null,
        });
        if (existing) {
            if (existing.status === 'pending') {
                return res.status(409).json({ success: false, message: 'Request already sent.' });
            }
            if (existing.status === 'accepted') {
                return res.status(409).json({ success: false, message: 'Already connected.' });
            }
        }

        const doc = await Request.findOneAndUpdate(
            { fromUserId, toUserId, roomId: roomIdStr || null },
            { $set: { status: 'pending', respondedAt: null } },
            { new: true, upsert: true }
        ).populate('toUserId', 'name age city photo profilePicture');

        await createNotification(
            toUserId,
            'request_received',
            'New connection request',
            'You have a new connection request.',
            { fromUserId: fromUserId.toString(), roomId: roomIdStr || null, requestId: doc?._id?.toString?.() }
        );

        const reversePending = await Request.findOne({
            fromUserId: toUserId,
            toUserId: fromUserId,
            status: 'pending',
            roomId: roomIdStr || null,
        });

        if (reversePending) {
            await Promise.all([
                Request.findOneAndUpdate(
                    { fromUserId, toUserId, roomId: roomIdStr || null },
                    { $set: { status: 'accepted', respondedAt: new Date() } }
                ),
                Request.findOneAndUpdate(
                    { fromUserId: toUserId, toUserId: fromUserId, roomId: roomIdStr || null },
                    { $set: { status: 'accepted', respondedAt: new Date() } }
                ),
            ]);

            await Promise.all([
                createNotification(
                    fromUserId,
                    'request_accepted',
                    'Your request was accepted',
                    "It's a match — you can start chatting now.",
                    { withUserId: toUserId.toString(), roomId: roomIdStr || null }
                ),
                createNotification(
                    toUserId,
                    'request_accepted',
                    'Your request was accepted',
                    "It's a match — you can start chatting now.",
                    { withUserId: fromUserId.toString(), roomId: roomIdStr || null }
                ),
            ]);

            return res.status(201).json({
                success: true,
                message: 'It\'s a match! Connection accepted.',
                request: doc.toObject(),
                matched: true,
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Request sent.',
            request: doc.toObject(),
            matched: false,
        });
    } catch (err) {
        console.error('sendRequest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * POST /api/request/pass
 */
async function passRequest(req, res) {
    try {
        const fromUserId = req.userId;
        const { toUserId, roomId } = req.body || {};
        if (!toUserId) {
            return res.status(400).json({ success: false, message: 'toUserId required.' });
        }

        const roomIdStr = roomId ? String(roomId) : null;
        const doc = await Request.findOneAndUpdate(
            { fromUserId, toUserId, roomId: roomIdStr || null },
            { $set: { status: 'rejected', respondedAt: new Date() } },
            { new: true, upsert: true }
        ).populate('toUserId', 'name age city photo profilePicture');

        return res.status(201).json({
            success: true,
            message: 'Profile passed.',
            request: doc?.toObject?.() ?? doc,
        });
    } catch (err) {
        console.error('passRequest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * POST /api/request/accept
 */
async function acceptRequest(req, res) {
    try {
        const toUserId = req.userId;
        const { requestId, fromUserId, roomId } = req.body || {};
        let query = { toUserId, status: 'pending' };
        if (requestId) query._id = requestId;
        else if (fromUserId) query.fromUserId = fromUserId;
        else return res.status(400).json({ success: false, message: 'requestId or fromUserId required.' });

        if (roomId && !requestId) query.roomId = String(roomId);

        const doc = await Request.findOneAndUpdate(
            query,
            { $set: { status: 'accepted', respondedAt: new Date() } },
            { new: true }
        ).populate('fromUserId', 'name age city photo profilePicture');

        if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });

        await createNotification(
            doc.fromUserId?._id || fromUserId,
            'request_accepted',
            'Your request was accepted',
            'You can now start chatting.',
            { toUserId: toUserId.toString(), roomId: doc.roomId ? String(doc.roomId) : null, requestId: doc._id.toString() }
        );

        return res.json({ success: true, message: 'Request accepted.', request: doc.toObject() });
    } catch (err) {
        console.error('acceptRequest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * POST /api/request/reject
 */
async function rejectRequest(req, res) {
    try {
        const toUserId = req.userId;
        const { requestId, fromUserId, roomId } = req.body || {};
        let query = { toUserId, status: 'pending' };
        if (requestId) query._id = requestId;
        else if (fromUserId) query.fromUserId = fromUserId;
        else return res.status(400).json({ success: false, message: 'requestId or fromUserId required.' });

        if (roomId && !requestId) query.roomId = String(roomId);

        const doc = await Request.findOneAndUpdate(
            query,
            { $set: { status: 'rejected', respondedAt: new Date() } },
            { new: true }
        );

        if (!doc) return res.status(404).json({ success: false, message: 'Request not found.' });

        return res.json({ success: true, message: 'Request rejected.', request: doc.toObject() });
    } catch (err) {
        console.error('rejectRequest error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /api/request/received
 */
async function receivedRequests(req, res) {
    try {
        const currentUser = await User.findById(req.userId);
        const roomId = req.query?.roomId ? String(req.query.roomId) : null;
        const roomFilter = roomId ? { roomId: roomId } : {};

        const list = await Request.find({ toUserId: req.userId, status: 'pending', ...roomFilter })
            .populate('fromUserId', 'name age city photo profilePicture bio budgetRange profession lifestylePreferences')
            .populate('roomId')
            .sort({ createdAt: -1 })
            .lean();

        const enriched = list.filter(r => r.fromUserId).map(r => {
            const { matchScore, reasons } = calculateMatch(currentUser, r.fromUserId);
            return {
                ...r,
                matchScore,
                match: matchScore,
                reasons,
            };
        });

        return res.json({ success: true, requests: enriched });
    } catch (err) {
        console.error('receivedRequests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /api/request/received/accepted
 */
async function receivedAcceptedRequests(req, res) {
    try {
        const currentUser = await User.findById(req.userId);
        const roomId = req.query?.roomId ? String(req.query.roomId) : null;
        const roomFilter = roomId ? { roomId: roomId } : {};

        const list = await Request.find({ toUserId: req.userId, status: 'accepted', ...roomFilter })
            .populate('fromUserId', 'name age city photo profilePicture bio budgetRange profession lifestylePreferences')
            .populate('roomId')
            .sort({ createdAt: -1 })
            .lean();

        const enriched = list.filter(r => r.fromUserId).map(r => {
            const { matchScore, reasons } = calculateMatch(currentUser, r.fromUserId);
            return { ...r, matchScore, match: matchScore, reasons };
        });

        return res.json({ success: true, requests: enriched });
    } catch (err) {
        console.error('receivedAcceptedRequests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

/**
 * GET /api/request/sent
 */
async function sentRequests(req, res) {
    try {
        const currentUser = await User.findById(req.userId);
        const roomId = req.query?.roomId ? String(req.query.roomId) : null;
        const roomFilter = roomId ? { roomId: roomId } : {};

        const list = await Request.find({ fromUserId: req.userId, ...roomFilter })
            .populate('toUserId', 'name age city photo profilePicture bio budgetRange profession lifestylePreferences')
            .populate('roomId')
            .sort({ createdAt: -1 })
            .lean();

        const enriched = list.filter(r => r.toUserId).map(r => {
            const { matchScore, reasons } = calculateMatch(currentUser, r.toUserId);
            return { ...r, matchScore, match: matchScore, reasons };
        });

        return res.json({ success: true, requests: enriched });
    } catch (err) {
        console.error('sentRequests error:', err);
        return res.status(500).json({ success: false, message: err.message || 'Server error.' });
    }
}

module.exports = {
    sendRequest,
    passRequest,
    acceptRequest,
    rejectRequest,
    receivedRequests,
    receivedAcceptedRequests,
    sentRequests
};
