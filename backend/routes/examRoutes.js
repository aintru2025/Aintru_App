const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller");
const { validateSession } = require("../middlewares/auth.middleware");

router.post("/start", validateSession, examController.startExamInterview);

router.post(
  "/:sessionId/answer",
  validateSession,
  examController.submitExamAnswer
);

router.post(
  "/:sessionId/answers",
  validateSession,
  examController.submitAllExamAnswers
);


router.post(
  "/:sessionId/complete",
  validateSession,
  examController.completeExamInterview
);

router.post(
  "/:sessionId/summary",
  validateSession,
  examController.generateExamSummary
);

router.post(
  "/:sessionId/video-frame",
  validateSession,
  examController.addVideoFrame
);

module.exports = router;
