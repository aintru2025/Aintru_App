const examService = require("../services/examService");


async function startExamInterview(req, res) {
  try {
    const { examType } = req.body;
    const userId = req.userId; 

    if (!examType) {
      return res.status(400).json({ error: "Exam type is required" });
    }

    const session = await examService.startExamInterview(userId, examType);

    return res.status(201).json({
      message: "Exam interview started",
      session,
    });
  } catch (err) {
    console.error("❌ Error starting exam interview:", err.message);
    return res.status(500).json({ error: "Failed to start exam interview" });
  }
}


async function completeExamInterview(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await examService.evaluateExam(sessionId);

    return res.status(200).json({
      message: "Exam interview evaluated",
      session,
    });
  } catch (err) {
    console.error("❌ Error evaluating exam:", err.message);
    return res.status(500).json({ error: "Failed to evaluate exam" });
  }
}


async function generateExamSummary(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await examService.generateSummary(sessionId);

    return res.status(200).json({
      message: "Summary generated",
      session,
    });
  } catch (err) {
    console.error("❌ Error generating summary:", err.message);
    return res.status(500).json({ error: "Failed to generate summary" });
  }
}

module.exports = {
  startExamInterview,
  completeExamInterview,
  generateExamSummary,
};
