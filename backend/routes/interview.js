const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interview.controller");

// AI-powered interview routes
router.post("/generate-question", interviewController.generateQuestion);
router.post(
  "/generate-voice-response",
  interviewController.generateVoiceResponse
);
router.post("/transcribe", interviewController.transcribe);
router.post("/ai-response", interviewController.aiResponse);
router.post("/analyze-video", interviewController.analyzeVideoFrame);
router.post("/complete", interviewController.completeInterview);

// History & Reports
router.get("/history/:userId", interviewController.getInterviewHistory);
router.get("/report/:reportId", interviewController.getInterviewReport);

module.exports = router;
