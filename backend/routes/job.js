const express = require("express");
const router = express.Router();
const jobController = require("../controllers/job.controller");
const { validateSession } = require("../middlewares/auth.middleware");

// POST /api/interviewFlow/generate-interview-flow
router.post(
  "/interviewFlow/generate-interview-flow",
  jobController.generateInterviewFlow
);

// POST /api/interview/start (requires auth)
router.post(
  "/interview/start",
  validateSession,
  jobController.startJobInterview
);

// POST /api/interview/:sessionId/frame (no auth required)
router.post("/interview/:sessionId/frame", jobController.addVideoFrame);

// POST /api/interview/:sessionId/evaluate (requires auth)
router.post(
  "/interview/:sessionId/evaluate",
  validateSession,
  jobController.evaluateInterview
);

// POST /api/interview/:sessionId/summary (requires auth)
router.post(
  "/interview/:sessionId/summary",
  validateSession,
  jobController.generateSummary
);

// GET /api/interview/:sessionId/metrics (no auth required)
router.get("/interview/:sessionId/metrics", jobController.getVideoMetrics);

module.exports = router;
