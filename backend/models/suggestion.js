const mongoose = require('mongoose');

const SuggestionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobs: [{
    company: String,
    role: String,
    matchScore: Number,
    link: String,
  }],
  companies: [{
    name: String,
    matchScore: Number,
    link: String,
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Suggestion', SuggestionSchema); 