const { GoogleGenerativeAI } = require("@google/generative-ai");
const examConfig = require("../config/examConfig");
const ExamInterview = require("../models/ExamInterview");


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


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


async function startExamInterview(userId, examType) {
  const config = examConfig[examType] || examConfig.DEFAULT;

  // generate questions
  const questions = await generateQuestions(examType, config.questions);

  // prepare session
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


async function evaluateExam(sessionId) {
  const session = await ExamInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const qnaPairs = session.questions
    .map(
      (q, idx) =>
        `Q${idx + 1}: ${q.question}\nAnswer: ${q.userAnswer || "Not answered"}`
    )
    .join("\n\n");

  const prompt = `Evaluate the following ${session.examType} interview answers.
  For each question, say whether the answer is correct or not, and provide short feedback.
  
  ${qnaPairs}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();


  session.summary = text;
  session.isCompleted = true;
  await session.save();

  return session;
}


async function generateSummary(sessionId) {
  const session = await ExamInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const qnaPairs = session.questions
    .map(
      (q, idx) =>
        `Q${idx + 1}: ${q.question}\nAnswer: ${q.userAnswer || "Not answered"}`
    )
    .join("\n\n");

  const prompt = `Based on this ${session.examType} interview, write a summary of performance.
  Highlight strengths, weaknesses, and areas for improvement. Keep it concise and structured.

  ${qnaPairs}`;

  const result = await model.generateContent(prompt);
  const summary = result.response.text();

  session.summary = summary;
  session.isCompleted = true;
  await session.save();

  return session;
}

module.exports = {
  startExamInterview,
  evaluateExam,
  generateSummary,
};
