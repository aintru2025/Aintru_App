const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
// auth middleware that sets req.userId if required
const auth = require("../middleware/auth"); // adapt to your auth

// POST /api/interviewFlow/generate-interview-flow
router.post(
  "/interviewFlow/generate-interview-flow",
  auth.optional,
  jobController.generateInterviewFlow
);

// POST /api/interview/start
router.post("/interview/start", auth.required, jobController.startJobInterview);

// POST /api/interview/:sessionId/frame
router.post(
  "/interview/:sessionId/frame",
  auth.optional,
  jobController.addVideoFrame
);

// POST /api/interview/:sessionId/evaluate
router.post(
  "/interview/:sessionId/evaluate",
  auth.required,
  jobController.evaluateInterview
);

// POST /api/interview/:sessionId/summary
router.post(
  "/interview/:sessionId/summary",
  auth.required,
  jobController.generateSummary
);

// GET /api/interview/:sessionId/metrics
router.get(
  "/interview/:sessionId/metrics",
  auth.optional,
  jobController.getVideoMetrics
);

module.exports = router;
