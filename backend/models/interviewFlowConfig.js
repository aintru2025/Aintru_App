const mongoose = require('mongoose');

const InterviewFlowConfigSchema = new mongoose.Schema({
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
  rounds: [{
    round: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['DSA', 'Behavioral', 'System Design', 'Technical', 'HR', 'Coding'],
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    questionType: {
      type: String,
      enum: ['coding', 'behavioral', 'system_design', 'technical', 'hr'],
      required: true
    },
    description: String
  }],
  totalDuration: Number,
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.InterviewFlowConfig || mongoose.model('InterviewFlowConfig', InterviewFlowConfigSchema); 