const { GoogleGenerativeAI } = require("@google/generative-ai");
const JobInterview = require("../models/JobInterview");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Ask Gemini to generate a job interview flow (rounds + round-wise questions)
 * We ask for a strict JSON output so we can parse reliably.
 *
 * Returned JSON shape:
 * {
 *  "company": "...",
 *  "role": "...",
 *  "rounds": [
 *    { "round": 1, "name": "...", "type": "...", "description":"...", "duration": 30, "questions": ["q1","q2"] },
 *    ...
 *  ]
 * }
 */
async function generateInterviewFlow(
  company = "Target Company",
  role = "Software Developer",
  experience = "Fresher"
) {
  const prompt = `You are asked to design a realistic interview process for hiring a ${role} at ${company}.
Return a JSON object ONLY (no extra explanation) with the following structure:
{
  "company": "<company name>",
  "role": "<role>",
  "rounds": [
    {
      "round": 1,
      "name": "<round name>",
      "type": "<round type - e.g., technical, coding, hr, system-design>",
      "description": "<short description>",
      "duration": <minutes - integer>,
      "questions": ["question 1", "question 2", ...]
    }
  ]
}
Design between 3 and 6 rounds depending on role. For each round include 3–6 questions appropriate to the round type. Keep JSON concise. Experience level: ${experience}.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  let jsonText = text.trim();
  try {
    const firstBrace = jsonText.indexOf("{");
    const lastBrace = jsonText.lastIndexOf("}");
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      jsonText = jsonText.slice(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    console.warn("Failed to parse flow JSON, using fallback:", err.message);
    return {
      company,
      role,
      rounds: [
        {
          round: 1,
          name: "Technical Questions",
          type: "technical",
          description: "Short technical Q&A",
          duration: 30,
          questions: [
            `What is an algorithm you frequently use for ${role}?`,
            `Explain time vs space complexity with an example.`,
            `What data structures would you choose for caching?`,
          ],
        },
        {
          round: 2,
          name: "Coding Round",
          type: "coding",
          description: "Solve a coding problem with discussion.",
          duration: 45,
          questions: [
            "Implement a function to reverse a linked list.",
            "Find the missing number in an array of size n-1 with numbers from 1..n.",
            "Given a string, find the longest palindromic substring.",
          ],
        },
        {
          round: 3,
          name: "Behavioral / HR",
          type: "hr",
          description: "Behavioral questions and fitment",
          duration: 20,
          questions: [
            "Tell me about a time you faced conflict in a team and how you resolved it.",
            "What are your long-term career goals?",
            "Why do you want to join this company?",
          ],
        },
      ],
    };
  }
}

/**
 * Start a new job interview session and persist it
 */
async function startJobInterview(
  userId,
  company = "Target Company",
  role = "Software Developer",
  experience = "Fresher",
  candidateProfileId = null
) {
  const flow = await generateInterviewFlow(company, role, experience);

  // 🔹 Convert to DB-friendly schema
  const rounds = (flow.rounds || []).map((r, idx) => {
    const isCodingRound = r.type?.toLowerCase().includes("coding");

    return {
      round: r.round ?? idx + 1,
      name: r.name || `Round ${idx + 1}`,
      type: r.type || "general",
      description: r.description || "",
      duration: r.duration ?? 30,
      questions: (r.questions || []).map((q) => ({
        question: q,
        isCodingQuestion: isCodingRound, // ✅ Mark coding questions automatically
        code: isCodingRound ? { language: "", content: "" } : undefined,
      })),
    };
  });

  const totalDuration = rounds.reduce((sum, r) => sum + (r.duration || 0), 0);

  const session = new JobInterview({
    userId,
    company: flow.company || company,
    role: flow.role || role,
    candidateProfileId,
    rounds,
    totalRounds: rounds.length,
    totalDuration,
  });

  await session.save();
  return session;
}


/**
 * Submit a single answer for a given question in a round
 */
const MAX_CROSS_QUESTIONS = 3;

async function submitAnswer({
  interviewId,
  roundIndex,
  questionIndex,
  userAnswer,
  codeSnippet,
  language,
}) {
  const interview = await JobInterview.findById(interviewId);
  if (!interview) throw new Error("Interview not found");

  const round = interview.rounds[roundIndex];
  if (!round) throw new Error("Invalid round index");

  const question = round.questions[questionIndex];
  if (!question) throw new Error("Invalid question index");

  // ✅ Step 1️⃣: Prepare base answer (text + optional code)
  let fullAnswer = userAnswer || "";
  if (codeSnippet) {
    fullAnswer += `\n\n[User submitted code in ${
      language || "unknown"
    }]\n${codeSnippet}`;
  }

  // ✅ Step 2️⃣: Evaluate using Gemini (skip if coding-type and no text)
  let evaluation = { score: 5, feedback: "Answer recorded." };

  if (userAnswer || !question.isCodingQuestion) {
    const prompt = `Question: ${question.question}
Answer: ${userAnswer || "(none)"}${codeSnippet ? `\nCode:\n${codeSnippet}` : ""}
Evaluate this ${
      question.isCodingQuestion ? "coding" : "theory"
    } answer objectively. 
Give JSON only: { "score": <0-10>, "feedback": "<one-line>" }`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}") + 1;
      evaluation = JSON.parse(text.slice(start, end));
    } catch {
      evaluation = { score: 5, feedback: "Could not parse evaluation." };
    }
  }

  // ✅ Step 3️⃣: Save response
  question.userAnswer = userAnswer;
  if (codeSnippet) {
    question.code = { language, content: codeSnippet };
  }
  question.score = evaluation.score;
  question.feedback = evaluation.feedback;

  // ✅ Step 4️⃣: Conditional cross-question (same as before)
  const unsatisfactory =
    evaluation.score < 7 ||
    (evaluation.feedback &&
      evaluation.feedback.toLowerCase().includes("unsatisfactory"));

  const totalCrossQs = interview.rounds.reduce(
    (sum, r) =>
      sum +
      r.questions.reduce(
        (qsum, q) => qsum + (q.crossQuestions?.length || 0),
        0
      ),
    0
  );

  if (unsatisfactory && totalCrossQs < MAX_CROSS_QUESTIONS) {
    const crossPrompt = `The candidate gave an unsatisfactory answer to:
Question: ${question.question}
Answer: ${userAnswer}
${codeSnippet ? `Code:\n${codeSnippet}` : ""}
Generate ONE short follow-up cross-question to test understanding.`;

    const crossRes = await model.generateContent(crossPrompt);
    const crossText = crossRes.response.text().trim();

    question.crossQuestions.push({
      question: crossText,
      userAnswer: "",
      score: null,
      feedback: "",
    });
  }

  // ✅ Step 5️⃣: Save interview
  await interview.save();

  // ✅ Step 6️⃣: Mark complete if all answered
  const allAnswered = interview.rounds.every((r) =>
    r.questions.every(
      (q) => q.userAnswer || q.crossQuestions.every((cq) => cq.userAnswer)
    )
  );

  if (allAnswered && !interview.isCompleted) {
    interview.isCompleted = true;
    await generateSummary(interviewId);
  }

  return interview;
}


/**
 * Submit all answers at once
 * Expects answers in the format:
 * [
 *   { roundIndex: 0, questionIndex: 0, answer: "..." },
 *   { roundIndex: 0, questionIndex: 1, answer: "..." },
 *   ...
 * ]
 */
async function submitAllAnswers(sessionId, answers) {
  const session = await JobInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  answers.forEach(({ roundIndex, questionIndex, answer }) => {
    if (
      session.rounds[roundIndex] &&
      session.rounds[roundIndex].questions[questionIndex]
    ) {
      session.rounds[roundIndex].questions[questionIndex].userAnswer = answer;
    }
  });

  await session.save();
  return session;
}

/**
 * Compute aggregated metrics from raw video frames (same as exam)
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
 * Add video analysis frame to session
 */
async function addVideoAnalysisFrame(sessionId, frameData) {
  const session = await JobInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  session.videoAnalysis.push({
    timestamp: new Date(),
    ...frameData,
  });

  session.behavioralMetrics = computeVideoMetrics(session);
  await session.save();
  return session;
}

/**
 * Evaluate a finished job interview: use Gemini to evaluate each Q&A and produce feedback
 */
async function evaluateJobInterview(sessionId) {
  const session = await JobInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  // Build Q/A pairs including cross-questions
  const qnaPairs = [];
  session.rounds.forEach((round) => {
    round.questions.forEach((q) => {
      // Main question
      qnaPairs.push({
        question: q.question,
        answer: q.userAnswer || "Not answered",
        qIndex: qnaPairs.length + 1,
        isCoding: q.isCodingQuestion || false, // <-- Added flag
      });

      // Cross-questions (if any)
      q.crossQuestions?.forEach((cq) => {
        qnaPairs.push({
          question: cq.question,
          answer: cq.userAnswer || "Not answered",
          qIndex: qnaPairs.length + 1,
          parentQuestion: q.question,
          isCoding: cq.isCodingQuestion || false, // optional future support
        });
      });
    });
  });

  const qnaText = qnaPairs
    .map(
      (q) =>
        `Q${q.qIndex}: ${q.question}\nAnswer: ${q.answer}\nType: ${
          q.isCoding ? "Coding" : "Non-Coding"
        }`
    )
    .join("\n\n");

  const behavior = session.behavioralMetrics
    ? `\n\nDuring the interview, video analysis showed: 
    - Face presence: ${session.behavioralMetrics.presencePct}% 
    - Multiple faces: ${session.behavioralMetrics.multipleFacesPct}% 
    - Avg emotions: ${JSON.stringify(session.behavioralMetrics.avgEmotions)}`
    : "";

  // 🔹 Updated prompt to account for coding vs non-coding questions
  const prompt = `You are an interviewer evaluating answers for a ${session.role} role at ${session.company}.

For each question:
- If "isCoding" is true, evaluate the code logic, efficiency, and correctness.
- If "isCoding" is false, evaluate conceptual clarity, reasoning, and communication.

For each main and follow-up (cross) question, provide:
  - "qIndex" matching the question number,
  - "score" out of 10,
  - "verdict" (good / ok / poor),
  - "feedback" (short comment).

${behavior}

${qnaText}

Return your evaluation strictly as a JSON array like:
[
  { "qIndex": 1, "score": 8, "verdict": "good", "feedback": "...", "isCoding": true/false },
  ...
]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // attempt to parse model JSON response
  let evaluations = [];
  try {
    const first = text.indexOf("[");
    const last = text.lastIndexOf("]");
    const jsonText = text.slice(first, last + 1);
    evaluations = JSON.parse(jsonText);
  } catch (err) {
    console.warn(
      "Failed to parse evaluations from model, saving raw text as summary",
      err.message
    );
    session.summary = text;
    session.isCompleted = true;
    session.behavioralMetrics = computeVideoMetrics(session);
    await session.save();
    return session;
  }

  // Apply evaluations back to main questions and cross-questions
  let qCounter = 0;
  for (const round of session.rounds) {
    for (const q of round.questions) {
      const evalObj = evaluations[qCounter] || null;
      if (evalObj) {
        q.score = typeof evalObj.score === "number" ? evalObj.score : null;
        q.feedback = evalObj.feedback || "";
      }
      qCounter++;

      if (q.crossQuestions?.length) {
        q.crossQuestions.forEach((cq) => {
          const crossEval = evaluations[qCounter] || null;
          if (crossEval) {
            cq.score =
              typeof crossEval.score === "number" ? crossEval.score : null;
            cq.feedback = crossEval.feedback || "";
          }
          qCounter++;
        });
      }
    }
  }

  // Summarize overall performance including cross-questions
  const summaryPrompt = `Based on the evaluations, write a structured performance summary for the candidate interviewing for ${
    session.role
  } at ${session.company}. 
Include:
- Overall coding performance (if applicable)
- Conceptual and communication strengths
- Weaknesses
- Suggestions for improvement
- Mention if cross questions revealed deeper insights.

Evaluations:
${JSON.stringify(evaluations, null, 2)}
`;

  const summaryRes = await model.generateContent(summaryPrompt);
  const summaryText = summaryRes.response.text();

  session.summary = summaryText;
  session.isCompleted = true;
  session.behavioralMetrics = computeVideoMetrics(session);
  await session.save();

  return session;
}


/**
 * Generate a high-level summary separately (if needed)
 */
async function generateSummary(sessionId) {
  const session = await JobInterview.findById(sessionId);
  if (!session) throw new Error("Session not found");

  // Build Q/A pairs including cross-questions
  const qnaPairs = [];
  session.rounds.forEach((round) => {
    round.questions.forEach((q) => {
      qnaPairs.push({
        question: q.question,
        answer: q.userAnswer || "Not answered",
        score: q.score ?? null,
        isCoding: q.isCodingQuestion || false, // <-- Added
      });
      q.crossQuestions?.forEach((cq) => {
        qnaPairs.push({
          question: cq.question,
          answer: cq.userAnswer || "Not answered",
          score: cq.score ?? null,
          parentQuestion: q.question,
          isCoding: cq.isCodingQuestion || false, // <-- Added
        });
      });
    });
  });

  const behavior = session.behavioralMetrics
    ? `\n\nVideo analysis insights:
    - Face presence: ${session.behavioralMetrics.presencePct}%
    - Multiple faces: ${session.behavioralMetrics.multipleFacesPct}%
    - Avg emotions: ${JSON.stringify(session.behavioralMetrics.avgEmotions)}`
    : "";

  // 🧩 Updated prompt for coding-awareness and cross-question emphasis
  const prompt = `You are an AI interviewer summarizing the candidate's performance for the ${
    session.role
  } role at ${session.company}.

For each question:
- If "isCoding" is true, assess the coding logic, efficiency, correctness, and problem-solving approach.
- If "isCoding" is false, focus on conceptual understanding, communication, and clarity.
- Mention insights revealed by follow-up/cross questions when relevant.

Then, write a final structured summary including:
1. Strengths (coding + conceptual)
2. Weaknesses / areas to improve
3. Observed behavioral & non-verbal traits
4. Overall impression / hiring suggestion

Candidate's Question-Answer data:
${JSON.stringify(qnaPairs, null, 2)}
${behavior}`;

  const result = await model.generateContent(prompt);
  const summary = result.response.text();

  session.summary = summary;
  session.isCompleted = true;
  session.behavioralMetrics = computeVideoMetrics(session);
  await session.save();

  return session;
}


/**
 * Utility: get session by id
 */
async function getSessionById(sessionId) {
  return JobInterview.findById(sessionId);
}

module.exports = {
  generateInterviewFlow,
  startJobInterview,
  submitAnswer,
  submitAllAnswers,
  addVideoAnalysisFrame,
  computeVideoMetrics,
  evaluateJobInterview,
  generateSummary,
  getSessionById,
};
