const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    roomKey: { type: String, required: true, index: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', default: null },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    deliveredAt: { type: Date, default: Date.now },
    seenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ roomKey: 1, createdAt: -1 });
messageSchema.index({ participants: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
