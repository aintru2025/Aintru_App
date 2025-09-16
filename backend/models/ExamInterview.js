const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    userAnswer: { type: String },
    isCorrect: { type: Boolean, default: null },
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
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamInterview", ExamInterviewSchema);
