const Message = require('../models/Message');
const User = require('../models/User');
const { canUsersChat } = require('../services/chatAccessService');

function toClientMessage(doc, currentUserId) {
  return {
    _id: doc._id,
    senderId: doc.senderId,
    receiverId: doc.receiverId,
    message: doc.message,
    roomId: doc.roomId || null,
    createdAt: doc.createdAt,
    isOwn: String(doc.senderId?._id || doc.senderId) === String(currentUserId),
  };
}

async function getChatHistory(req, res) {
  try {
    const currentUserId = req.userId;
    const otherUserId = req.query?.userId;
    const roomId = req.query?.roomId || null;

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'userId query is required.' });
    }

    const access = await canUsersChat(currentUserId, otherUserId, roomId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason });
    }

    const messages = await Message.find({ roomKey: access.roomKey })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name photo profilePicture')
      .lean();

    return res.json({
      success: true,
      roomKey: access.roomKey,
      messages: messages.map((m) => toClientMessage(m, currentUserId)),
    });
  } catch (err) {
    console.error('getChatHistory error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

async function getChatThreads(req, res) {
  try {
    const currentUserId = String(req.userId);
    const roomId = req.query?.roomId || null;

    const acceptedQuery = {
      status: 'accepted',
      $or: [{ fromUserId: currentUserId }, { toUserId: currentUserId }],
    };
    if (roomId) acceptedQuery.roomId = roomId;

    const { Request } = require('../models/Request');
    const accepted = await Request.find(acceptedQuery)
      .select('fromUserId toUserId roomId updatedAt')
      .lean();

    const counterpartIds = [];
    const roomForUser = new Map();

    for (const item of accepted) {
      const otherId = String(item.fromUserId) === currentUserId ? String(item.toUserId) : String(item.fromUserId);
      counterpartIds.push(otherId);
      roomForUser.set(otherId, item.roomId ? String(item.roomId) : null);
    }

    const uniqueIds = [...new Set(counterpartIds)];
    if (uniqueIds.length === 0) return res.json({ success: true, threads: [] });

    const users = await User.find({ _id: { $in: uniqueIds } })
      .select('name photo profilePicture')
      .lean();

    const userMap = new Map(users.map((u) => [String(u._id), u]));

    const threads = [];
    for (const otherId of uniqueIds) {
      const scopedRoomId = roomForUser.get(otherId) || null;
      const access = await canUsersChat(currentUserId, otherId, scopedRoomId);
      if (!access.allowed) continue;

      const lastMessage = await Message.findOne({ roomKey: access.roomKey })
        .sort({ createdAt: -1 })
        .select('message createdAt senderId')
        .lean();

      const u = userMap.get(otherId);
      if (!u) continue;

      threads.push({
        otherUserId: otherId,
        name: u.name,
        image: u.photo || u.profilePicture || '',
        roomId: scopedRoomId,
        roomKey: access.roomKey,
        unreadCount: 0,
        lastMessagePreview: lastMessage?.message || '',
        updatedAt: lastMessage?.createdAt || new Date(0),
      });
    }

    threads.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return res.json({ success: true, threads });
  } catch (err) {
    console.error('getChatThreads error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

async function sendMessage(req, res) {
  try {
    const currentUserId = req.userId;
    const { otherUserId, message, roomId = null } = req.body || {};
    const text = String(message || '').trim();

    if (!otherUserId) {
      return res.status(400).json({ success: false, message: 'otherUserId is required.' });
    }
    if (!text) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message cannot exceed 2000 characters.' });
    }

    const access = await canUsersChat(currentUserId, otherUserId, roomId);
    if (!access.allowed) {
      return res.status(403).json({ success: false, message: access.reason || 'Chat not allowed.' });
    }

    const doc = await Message.create({
      roomKey: access.roomKey,
      roomId: access.roomId || null,
      participants: [currentUserId, otherUserId],
      senderId: currentUserId,
      receiverId: otherUserId,
      message: text,
      seenBy: [currentUserId],
    });

    const populated = await Message.findById(doc._id)
      .populate('senderId', 'name photo profilePicture')
      .lean();

    const broadcastMsg = {
      _id: populated._id,
      senderId: populated.senderId,
      receiverId: populated.receiverId,
      roomId: populated.roomId || null,
      roomKey: populated.roomKey,
      message: populated.message,
      createdAt: populated.createdAt,
      deliveredAt: populated.deliveredAt,
    };

    const io = req.app?.get?.('io');
    if (io) {
      io.to([access.roomKey, `user:${String(currentUserId)}`, `user:${String(otherUserId)}`]).emit('new_message', broadcastMsg);
    }

    return res.status(201).json({
      success: true,
      message: toClientMessage(populated, currentUserId),
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Server error.' });
  }
}

module.exports = {
  getChatHistory,
  getChatThreads,
  sendMessage,
};
