const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    userAnswer: { type: String, default: "" },
    // optional evaluation/score per question
    score: { type: Number, default: null },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

const RoundSchema = new mongoose.Schema(
  {
    round: { type: Number },
    name: { type: String },
    type: { type: String }, // e.g., "hr", "technical", "coding", "system-design"
    duration: { type: Number }, // minutes
    description: { type: String },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

const VideoFrameSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  faceDetected: { type: Boolean },
  numFaces: { type: Number },
  emotions: { type: mongoose.Schema.Types.Mixed }, // object of emotion probabilities
});

const BehavioralMetricsSchema = new mongoose.Schema({
  framesCount: Number,
  presencePct: Number,
  multipleFacesPct: Number,
  avgEmotions: mongoose.Schema.Types.Mixed,
});

const JobInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    company: { type: String, default: "Target Company" },
    role: { type: String, default: "Software Developer" },
    candidateProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CandidateProfile",
      default: null,
    },
    rounds: [RoundSchema],
    totalRounds: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // minutes
    videoAnalysis: [VideoFrameSchema],
    behavioralMetrics: BehavioralMetricsSchema,
    isCompleted: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("JobInterview", JobInterviewSchema);
