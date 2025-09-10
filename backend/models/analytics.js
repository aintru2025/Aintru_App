const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interviewHistory: [{
    interview: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
    score: Number,
    date: Date,
  }],
  resumeHistory: [{
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
    atsScore: Number,
    date: Date,
  }],
  progress: {
    confidence: [Number], // e.g., array of confidence scores over time
    performance: [Number], // e.g., array of performance scores over time
    labels: [String], // e.g., dates or milestones
  },
  improvement: {
    suggestions: [String],
    lastImproved: Date,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Analytics', AnalyticsSchema); 