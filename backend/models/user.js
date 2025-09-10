const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  // Add password field for user authentication
  password: {
    type: String,
    required: true
  },
  // Remove password field since we're using phone as authentication
  provider: {
    type: String,
    enum: ['local', 'google', 'github'],
    default: 'local'
  },
  providerId: String,
  avatar: String,
  isVerified: {
    type: Boolean,
    default: true // Set to true since waitlist users are pre-verified
  },
  verificationToken: String,
  
  // Basic profile fields only
  surname: String,
  educationLevel: String,
  userType: {
    type: String,
    enum: ['student', 'professional'],
    default: 'student'
  },
  isStudent: Boolean,
  
  // Session management
  lastActivity: {
    type: Date,
    default: Date.now
  },
  sessionTimeout: {
    type: Number,
    default: 2 * 60 * 60 * 1000 // 2 hours in milliseconds
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.models.User || mongoose.model('User', UserSchema); 