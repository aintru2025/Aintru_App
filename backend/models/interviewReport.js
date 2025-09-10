const mongoose = require('mongoose');

const InterviewReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
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
  scores: {
    overall: {
      type: Number,
      min: 0,
      max: 10,
      required: true
    },
    technical: {
      type: Number,
      min: 0,
      max: 10
    },
    behavioral: {
      type: Number,
      min: 0,
      max: 10
    },
    communication: {
      type: Number,
      min: 0,
      max: 10
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10
    },
    problemSolving: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  recommendations: [String],
  transcript: String,
  faceAnalysis: {
    averageEyeContact: Number,
    averageStress: Number,
    averagePosture: Number,
    averageDistraction: Number,
    confidenceTrend: [Number]
  },
  strengths: [String],
  weaknesses: [String],
  readinessScore: {
    type: Number,
    min: 0,
    max: 10
  },
  readinessLevel: {
    type: String,
    enum: ['Not Ready', 'Needs Improvement', 'Ready', 'Well Prepared', 'Excellent'],
    default: 'Needs Improvement'
  },
  nextSteps: [String],
  companiesReady: [String],
  totalDuration: Number, // in minutes
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewReport', InterviewReportSchema); 