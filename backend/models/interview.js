const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CandidateProfile',
    required: true
  },
  company: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    required: true
  },
  interviewFlowConfigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewFlowConfig'
  },
  mode: {
    type: String,
    enum: ['voice', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['setup', 'in_progress', 'completed', 'cancelled'],
    default: 'setup'
  },
  currentRound: {
    type: Number,
    default: 1
  },
  totalRounds: {
    type: Number,
    required: true
  },
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  duration: Number, // in minutes
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if model already exists to prevent recompilation
module.exports = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema); 