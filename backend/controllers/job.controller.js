const jobService = require("../services/job.service");

async function generateInterviewFlow(req, res) {
  try {
    const { company, role, experience } = req.body;
    const flow = await jobService.generateInterviewFlow(
      company || "Target Company",
      role || "Software Developer",
      experience || "Fresher"
    );
    return res.status(200).json({ success: true, interviewFlow: flow });
  } catch (err) {
    console.error("❌ Error generating interview flow:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate interview flow" });
  }
}

async function startJobInterview(req, res) {
  try {
    const userId = req.userId; // ensure auth middleware sets userId
    const { company, role, experience, candidateProfileId } = req.body;
    const session = await jobService.startJobInterview(
      userId,
      company,
      role,
      experience,
      candidateProfileId
    );
    return res.status(201).json({ success: true, session });
  } catch (err) {
    console.error("❌ Error starting job interview:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to start job interview" });
  }
}

const submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { roundIndex, questionIndex, answer, code, language } = req.body;

    const session = await jobService.submitAnswer({
      interviewId: sessionId,
      roundIndex,
      questionIndex,
      userAnswer: answer,
      codeSnippet: code,
      language,
    });

    res.json({ message: "Answer submitted", session });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting answer", error: error.message });
  }
};



const submitAllAnswers = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers } = req.body;

    const session = await jobService.submitAllAnswers(
      sessionId,
      answers
    );

    res.json({ message: "All answers submitted", session });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting all answers", error: error.message });
  }
};

async function addVideoFrame(req, res) {
  try {
    const { sessionId } = req.params;
    const frameData = req.body;
    if (!frameData)
      return res.status(400).json({ error: "Frame data required" });
    const session = await jobService.addVideoAnalysisFrame(
      sessionId,
      frameData
    );
    return res.status(200).json({ success: true, sessionId: session._id });
  } catch (err) {
    console.error("❌ Error adding video frame:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to add video frame" });
  }
}

async function evaluateInterview(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await jobService.evaluateJobInterview(sessionId);
    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("❌ Error evaluating interview:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to evaluate interview" });
  }
}

async function generateSummary(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await jobService.generateSummary(sessionId);
    return res.status(200).json({ success: true, session });
  } catch (err) {
    console.error("❌ Error generating summary:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to generate summary" });
  }
}

async function getVideoMetrics(req, res) {
  try {
    const { sessionId } = req.params;
    const session = await jobService.getSessionById(sessionId);
    if (!session) return res.status(404).json({ error: "Session not found" });
    const metrics = jobService.computeVideoMetrics(session);
    return res.status(200).json({ success: true, metrics });
  } catch (err) {
    console.error("❌ Error getting video metrics:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to compute video metrics" });
  }
}

module.exports = {
  generateInterviewFlow,
  startJobInterview,
  submitAnswer,
  submitAllAnswers,
  addVideoFrame,
  evaluateInterview,
  generateSummary,
  getVideoMetrics,
};
