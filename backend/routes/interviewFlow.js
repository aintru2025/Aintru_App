const express = require("express");
const router = express.Router();

// use your existing middleware (validateSession)
const { validateSession } = require("../middlewares/auth.middleware");

const {
  companySuggestions,
  roleSuggestions,
  generateExamFlow,
  generateInterviewFlow,
} = require("../controllers/interviewFlow.controller");

// Test route
router.get("/test", (req, res) => {
  console.log("🧪 Test route hit!");
  res.json({ message: "InterviewFlow router is working!" });
});

// AI / feature routes
router.post("/company-suggestions", validateSession, companySuggestions);
router.post("/role-suggestions", validateSession, roleSuggestions);
router.post("/generate-exam-flow", validateSession, generateExamFlow);
router.post("/generate-interview-flow", validateSession, generateInterviewFlow);

module.exports = router;
