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
  rules: [{ type: String }],
  flatmatePreferences: {
    ageMin: { type: Number, default: 18 },
    ageMax: { type: Number, default: 100 },
    preferredGender: { type: String, enum: ['male', 'female', 'any', ''], default: 'any' },
    occupation: { type: String, enum: ['student', 'working', 'any', ''], default: 'any' },
    smokingAllowed: { type: String, enum: ['allowed', 'not_allowed', 'any', ''], default: 'any' },
    drinkingAllowed: { type: String, enum: ['allowed', 'not_allowed', 'any', ''], default: 'any' },
    petsAllowed: { type: String, enum: ['allowed', 'not_allowed', 'any', ''], default: 'any' },
    cleanlinessLevel: { type: String, enum: ['low', 'medium', 'high', 'any', ''], default: 'any' },
    sleepSchedule: { type: String, enum: ['early_sleeper', 'night_owl', 'any', ''], default: 'any' },
    foodPreference: { type: String, enum: ['veg', 'non-veg', 'any', ''], default: 'any' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
