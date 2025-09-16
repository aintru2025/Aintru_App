const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean, default: null },
  },
  { _id: false }
);

const VideoAnalysisSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    faceDetected: { type: Boolean, default: true },
    numFaces: { type: Number, default: 1 },
    emotions: {
      happy: { type: Number, default: 0 },
      sad: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      angry: { type: Number, default: 0 },
      surprised: { type: Number, default: 0 },
      disgusted: { type: Number, default: 0 },
      fearful: { type: Number, default: 0 },
    },
  },
  { _id: false }
);

const ExamInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examType: { type: String, required: true },
    questions: [QuestionSchema],
    currentIndex: { type: Number, default: 0 },
    totalQuestions: { type: Number, required: true },
    timeLimit: { type: Number, required: true }, // minutes
    isCompleted: { type: Boolean, default: false },
    summary: { type: String },

    
    videoAnalysis: [VideoAnalysisSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamInterview", ExamInterviewSchema);
