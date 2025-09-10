const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String }, // URL or path to the uploaded resume file
  atsScore: { type: Number }, // AI-generated ATS score
  skills: [String], // extracted or user-provided skills
  versions: [{
    fileUrl: String,
    atsScore: Number,
    createdAt: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Resume', ResumeSchema); 