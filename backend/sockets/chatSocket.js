const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const { canUsersChat } = require('../services/chatAccessService');

const JWT_SECRET = process.env.JWT_SECRET || 'rumi-jwt-secret-change-in-production';

function extractToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return String(authToken).replace(/^Bearer\s+/i, '').trim();

  const header = socket.handshake?.headers?.authorization;
  if (header && String(header).startsWith('Bearer ')) return String(header).slice(7).trim();

  return null;
}

async function createChatSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        process.env.CLIENT_URL || 'http://localhost:5173',
        'http://localhost:5173',
        'http://localhost:3000',
        'https://rumi-platform.vercel.app',
      ],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.userId).select('_id name');
      if (!user) return next(new Error('User not found'));

      socket.user = { userId: String(user._id), name: user.name || 'User' };
      return next();
    } catch (err) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const myRoom = `user:${socket.user.userId}`;
    socket.join(myRoom);

    socket.on('join_chat', async (payload = {}, ack) => {
      try {
        const otherUserId = payload.otherUserId;
        const roomId = payload.roomId || null;
        if (!otherUserId) throw new Error('otherUserId is required');

        const access = await canUsersChat(socket.user.userId, otherUserId, roomId);
        if (!access.allowed) throw new Error(access.reason || 'Not allowed');

        socket.join(access.roomKey);
        if (typeof ack === 'function') ack({ ok: true, roomKey: access.roomKey });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, error: err.message || 'Join failed' });
      }
    });

    socket.on('send_message', async (payload = {}, ack) => {
      try {
        const otherUserId = payload.otherUserId;
        const roomId = payload.roomId || null;
        const text = String(payload.message || '').trim();

        if (!otherUserId) throw new Error('otherUserId is required');
        if (!text) throw new Error('message is required');

        const access = await canUsersChat(socket.user.userId, otherUserId, roomId);
        if (!access.allowed) throw new Error(access.reason || 'Not allowed');

        const doc = await Message.create({
          roomKey: access.roomKey,
          roomId: access.roomId || null,
          participants: [socket.user.userId, otherUserId],
          senderId: socket.user.userId,
          receiverId: otherUserId,
          message: text,
          seenBy: [socket.user.userId],
        });

        const populated = await Message.findById(doc._id).populate('senderId', 'name photo profilePicture').lean();

        const msg = {
          _id: populated._id,
          senderId: populated.senderId,
          receiverId: populated.receiverId,
          roomId: populated.roomId || null,
          roomKey: populated.roomKey,
          message: populated.message,
          createdAt: populated.createdAt,
          deliveredAt: populated.deliveredAt,
        };

        io.to(access.roomKey).emit('new_message', msg);

        if (typeof ack === 'function') ack({ ok: true, message: msg });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, error: err.message || 'Send failed' });
      }
    });
  });

  return io;
}

module.exports = {
  createChatSocketServer,
};
