const { GoogleGenerativeAI } = require("@google/generative-ai");
const examConfig = require("../config/examConfig");
const ExamInterview = require("../models/ExamInterview");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * Generate questions from Gemini
 */
async function generateQuestions(examType, numQuestions) {
  const prompt = `Generate ${numQuestions} interview-style questions for the ${examType} exam.
  Provide only the questions in plain text list format.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const questions = text
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0);

  return questions;
}

/**
 * Start a new exam interview session
 */
async function startExamInterview(userId, examType) {
  const config = examConfig[examType] || examConfig.DEFAULT;

  const questions = await generateQuestions(examType, config.questions);

  const session = new ExamInterview({
    userId,
    examType,
    questions: questions.map((q) => ({ question: q })),
    totalQuestions: config.questions,
    timeLimit: config.timeMinutes,
  });

  await session.save();
  return session;
}

/**
 * Compute aggregated metrics from raw video frames
 */
function computeVideoMetrics(session) {
  const frames = session.videoAnalysis || [];
  const total = frames.length;
  if (total === 0) {
    return {
      framesCount: 0,
      presencePct: 0,
      multipleFacesPct: 0,
      avgEmotions: {},
    };
  }

  let presentCount = 0;
  let multipleFacesCount = 0;
  const emotionSums = {};
  const emotionKeys = Object.keys(frames[0].emotions || {});
  for (const k of emotionKeys) emotionSums[k] = 0;

  for (const f of frames) {
    if (f.faceDetected) presentCount++;
    if ((f.numFaces || 0) > 1) multipleFacesCount++;
    if (f.emotions) {
      for (const k of emotionKeys) {
        emotionSums[k] += f.emotions[k] ?? 0;
      }
    }
  }

  const avgEmotions = {};
  for (const k of emotionKeys) {
    avgEmotions[k] = +(emotionSums[k] / total).toFixed(3);
  }

  return {
    framesCount: total,
    presencePct: +((presentCount / total) * 100).toFixed(2),
    multipleFacesPct: +((multipleFacesCount / total) * 100).toFixed(2),
    avgEmotions,
  };
}

/**
 * Add a new frame and update behavioral metrics
 */
async function addVideoAnalysisFrame(sessionId, frameData) {
  const session = await ExamInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  session.videoAnalysis.push({
    timestamp: new Date(),
    ...frameData,
  });

  // update aggregated metrics
  session.behavioralMetrics = computeVideoMetrics(session);

  await session.save();
  return session;
}

/**
 * Evaluate Q&A performance
 */
async function evaluateExam(sessionId) {
  const session = await ExamInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const qnaPairs = session.questions
    .map(
      (q, idx) =>
        `Q${idx + 1}: ${q.question}\nAnswer: ${q.userAnswer || "Not answered"}`
    )
    .join("\n\n");

  const behavior = session.behavioralMetrics
    ? `\n\nDuring the interview, video analysis showed: 
    - Face presence: ${session.behavioralMetrics.presencePct}% 
    - Multiple faces: ${session.behavioralMetrics.multipleFacesPct}% 
    - Avg emotions: ${JSON.stringify(session.behavioralMetrics.avgEmotions)}`
    : "";

  const prompt = `Evaluate the following ${session.examType} interview answers.
  For each question, say whether the answer is correct or not, and provide short feedback.
  ${behavior}
  
  ${qnaPairs}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  session.summary = text;
  session.isCompleted = true;
  session.behavioralMetrics = computeVideoMetrics(session); // final update
  await session.save();

  return session;
}

/**
 * Generate a high-level summary
 */
async function generateSummary(sessionId) {
  const session = await ExamInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const qnaPairs = session.questions
    .map(
      (q, idx) =>
        `Q${idx + 1}: ${q.question}\nAnswer: ${q.userAnswer || "Not answered"}`
    )
    .join("\n\n");

  const behavior = session.behavioralMetrics
    ? `\n\nVideo analysis insights:
    - Face presence: ${session.behavioralMetrics.presencePct}%
    - Multiple faces: ${session.behavioralMetrics.multipleFacesPct}%
    - Avg emotions: ${JSON.stringify(session.behavioralMetrics.avgEmotions)}`
    : "";

  const prompt = `Based on this ${session.examType} interview, write a structured performance summary.
  Highlight strengths, weaknesses, and areas for improvement. Also, include non-verbal cues from video analysis.
  
  ${qnaPairs}
  ${behavior}`;

  const result = await model.generateContent(prompt);
  const summary = result.response.text();

  session.summary = summary;
  session.isCompleted = true;
  session.behavioralMetrics = computeVideoMetrics(session); // ensure up to date
  await session.save();

  return session;
}

module.exports = {
  startExamInterview,
  evaluateExam,
  generateSummary,
  addVideoAnalysisFrame,
};
