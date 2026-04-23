const mongoose = require("mongoose");

// Sub-schemas used inside user profile
const lifestylePreferencesSchema = new mongoose.Schema({
  smoking: { type: String, enum: ['yes', 'no', 'social', 'never', ''], default: 'no' },
  petsAllowed: { type: Boolean, default: false },
  sleepSchedule: { type: String, enum: ['early_sleeper', 'night_owl', 'flexible', ''], default: 'flexible' },
  foodPreference: { type: String, enum: ['veg', 'non-veg', 'egg', 'both', ''], default: 'veg' },
  cleanliness: { type: String, enum: ['low', 'medium', 'high', ''], default: 'medium' }
}, { _id: false });

const verificationStatusSchema = new mongoose.Schema({
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  aadharVerified: { type: Boolean, default: false }
}, { _id: false });

const notificationSettingsSchema = new mongoose.Schema({
  newMatches: { type: Boolean, default: true },
  messages: { type: Boolean, default: true },
  matchRequests: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: false },
  pushNotifications: { type: Boolean, default: true }
}, { _id: false });

const privacySettingsSchema = new mongoose.Schema({
  showOnlineStatus: { type: Boolean, default: true },
  showLocation: { type: Boolean, default: true },
  showLastSeen: { type: Boolean, default: false },
  profileVisibility: { type: String, enum: ['public', 'matches'], default: 'public' }
}, { _id: false });

const securitySettingsSchema = new mongoose.Schema({
  twoFactorEnabled: { type: Boolean, default: false },
  billingStatus: { type: String, default: 'Free' }
}, { _id: false });

const userSchema = new mongoose.Schema({
  // Basic auth fields
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    minlength: 3, trim: true 
  },
  email: { type: String, required: [true, 'Email is required'], lowercase: true, unique: true, trim: true },
  passwordHash: { type: String, required: [true, 'Password is required'], minlength: 6 },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  googleId: { type: String, default: '' },
  googlePicture: { type: String, default: null },
  phone: { type: String, trim: true, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // Profile (lifestyle-based)
  age: { type: Number, 
    min: 18, 
    max: 120 },
  gender: { type: String, enum: ['male', 'female', 'non_binary', 'other', ''], default: '' },
  city: { type: String, trim: true, default: '' },
  profession: { type: String, enum: ['student', 'working', 'WFH', 'hybrid', ''], default: '' },
  intent: { type: String, enum: ['find', 'offer', 'explore', ''], default: '' },
  budgetRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  bio: { type: String, default: '', maxlength: 500 },
  photo: { type: String, default: null },

  lifestylePreferences: { type: lifestylePreferencesSchema, default: () => ({}) },
  verificationStatus: { type: verificationStatusSchema, default: () => ({}) },

  // More fields
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  profilePicture: { type: String, default: null },
  notificationSettings: { type: notificationSettingsSchema, default: () => ({}) },
  privacySettings: { type: privacySettingsSchema, default: () => ({}) },
  securitySettings: { type: securitySettingsSchema, default: () => ({}) },
  verificationDocuments: [
    {
      type: { type: String, enum: ['aadhar', 'college_id'] },
      url: String,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  trustScore: { type: Number, default: 0, min: 0, max: 100 },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profileCompleted: { type: Boolean, default: false }
}, { timestamps: true });

// Indexes for faster queries
userSchema.index({ city: 1 });
userSchema.index({ 'lifestylePreferences.foodPreference': 1 });
userSchema.index({ trustScore: -1 });

module.exports = mongoose.model('User', userSchema);
