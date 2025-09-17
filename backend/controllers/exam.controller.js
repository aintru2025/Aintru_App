const examService = require("../services/exam.service");

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

async function addVideoFrame(req, res) {
  try {
    const { sessionId } = req.params;
    const frameData = req.body;

    if (!frameData) {
      return res.status(400).json({ error: "Frame data is required" });
    }

    const session = await examService.addVideoAnalysisFrame(
      sessionId,
      frameData
    );

    return res.status(200).json({
      message: "Frame added",
      sessionId: session._id,
    });
  } catch (err) {
    console.error("❌ Error adding video frame:", err.message);
    return res.status(500).json({ error: "Failed to add video frame" });
  }
}

async function getVideoMetrics(req, res) {
  try {
    const { sessionId } = req.params;

    const session = await examService.getSessionById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    const metrics = examService.computeVideoMetrics(session);

    return res.status(200).json({
      message: "Video metrics computed",
      metrics,
    });
  } catch (err) {
    console.error("❌ Error computing video metrics:", err.message);
    return res.status(500).json({ error: "Failed to compute video metrics" });
  }
}

module.exports = {
  startExamInterview,
  completeExamInterview,
  generateExamSummary,
  addVideoFrame,
  getVideoMetrics,
};
