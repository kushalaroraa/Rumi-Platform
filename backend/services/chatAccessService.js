const mongoose = require('mongoose');
const { Request } = require('../models/Request');

function normalizeObjectId(value) {
  try {
    if (!value) return null;
    return new mongoose.Types.ObjectId(String(value));
  } catch {
    return null;
  }
}

function buildRoomKey(userA, userB, roomId = null) {
  const a = String(userA);
  const b = String(userB);
  const pair = [a, b].sort().join(':');
  return `match:${pair}`;
}

async function canUsersChat(userA, userB, roomId = null) {
  const left = normalizeObjectId(userA);
  const right = normalizeObjectId(userB);

  if (!left || !right) return { allowed: false, reason: 'Invalid user ids.' };
  if (String(left) === String(right)) return { allowed: false, reason: 'Cannot chat with yourself.' };

  const query = {
    status: 'accepted',
    $or: [
      { fromUserId: left, toUserId: right },
      { fromUserId: right, toUserId: left },
    ],
  };

  const accepted = await Request.findOne(query).select('_id roomId').lean();

  if (accepted) {
    return {
      allowed: true,
      roomId: accepted.roomId ? String(accepted.roomId) : null,
      roomKey: buildRoomKey(left, right),
    };
  }

  return {
    allowed: false,
    reason: 'Chat is allowed only after request acceptance.',
  };
}

module.exports = {
  canUsersChat,
  buildRoomKey,
};
