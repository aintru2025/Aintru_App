const express = require("express");
const router = express.Router();
const examController = require("../controllers/examController");


router.post("/start", examController.startExamInterview);


router.post("/:sessionId/complete", examController.completeExamInterview);


router.post("/:sessionId/summary", examController.generateExamSummary);

module.exports = router;
