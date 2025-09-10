const mongoose = require('mongoose');

const CandidateProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: String,
  phone: String,
  experience: {
    type: Number,
    required: true,
    min: 0
  },
  skills: [String],
  education: {
    degree: String,
    institution: String,
    year: Number
  },
  lastRole: String,
  resumeText: String,
  domain: String,
  summary: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CandidateProfile', CandidateProfileSchema); 