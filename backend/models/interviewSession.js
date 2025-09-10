const mongoose = require('mongoose');

const InterviewSessionSchema = new mongoose.Schema({
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
  round: {
    type: Number,
    required: true
  },
  roundType: {
    type: String,
    enum: ['DSA', 'Behavioral', 'System Design', 'Technical', 'HR', 'Coding'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: String,
  codeSnapshot: String,
  score: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  feedback: String,
  duration: Number, // in seconds
  confidence: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  mediaPipeData: {
    eyeContact: Number,
    stress: Number,
    posture: Number,
    distraction: Number
  },
  transcript: String,
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('InterviewSession', InterviewSessionSchema); 