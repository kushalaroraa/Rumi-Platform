const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyType: { type: String, required: true },
  roomType: { type: String },
  monthlyRent: { type: Number, default: 0 },
  location: {
    area: { type: String },
    city: { type: String },
    address: { type: String },
    state: { type: String },
    pincode: { type: String }
  },
  photoUrls: [{ type: String }],
  coverUrl: { type: String },
  roomDescription: { type: String },
  status: { type: String, enum: ['active', 'paused', 'rented'], default: 'active' },
  viewsCount: { type: Number, default: 0 },
  totalRequests: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  avgCompatibilityScore: { type: Number, default: 0 },
  amenities: [{ type: String }],
  rules: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
