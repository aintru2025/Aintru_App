const express = require("express");
const router = express.Router();
const examController = require("../controllers/exam.controller");


router.post("/start", examController.startExamInterview);


router.post("/:sessionId/complete", examController.completeExamInterview);


router.post("/:sessionId/summary", examController.generateExamSummary);

router.post("/:sessionId/video-frame", examController.addVideoFrame);

module.exports = router;
