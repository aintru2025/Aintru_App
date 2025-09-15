const {
  gpt4oCall,
  gpt4oSTS,
  safeAICall,
  transcribeAudio,
  analyzeVideo,
} = require("../config/ai");
const Interview = require("../models/interview");
const InterviewSession = require("../models/interviewSession");
const InterviewReport = require("../models/interviewReport");
const fs = require("fs");

// 🎯 Generate interview question
const generateQuestion = async (req, res) => {
  try {
    const { company, role, round, roundType, candidateProfile } = req.body;

    const prompt = `You're a senior interviewer at ${company} conducting a ${roundType} round for the ${role} position.

    Candidate background: ${
      candidateProfile?.summary || "Software engineer with relevant experience"
    }

    Generate a challenging but appropriate question for round ${round} (${roundType} round).

    Return only the question text, no additional formatting or explanation.`;

    const question = await safeAICall(
      () => gpt4oCall(prompt, 200),
      () =>
        `Tell me about a challenging project you worked on and how you overcame obstacles.`,
      "Question generation AI unavailable"
    );

    res.json({ question });
  } catch (error) {
    console.error("Error generating question:", error);
    res.status(500).json({ error: "Failed to generate question" });
  }
};

// 🎯 Generate AI interviewer voice response
const generateVoiceResponse = async (req, res) => {
  try {
    const { question, context } = req.body;

    const prompt = `As an AI interviewer, speak this question naturally: "${question}"

    Context: ${context || "Interview round"}

    Return only the spoken text, no additional formatting.`;

    const voiceResponse = await safeAICall(
      () => gpt4oSTS(prompt, 150),
      () => question,
      "Voice response generation failed"
    );

    res.json({ voiceResponse });
  } catch (error) {
    console.error("Error generating voice response:", error);
    res.status(500).json({ error: "Failed to generate voice response" });
  }
};

// 🎯 Transcribe audio
const transcribe = async (req, res) => {
  try {
    if (!req.files || !req.files.audio) {
      return res.status(400).json({ error: "Audio file is required" });
    }

    const audioFile = req.files.audio;
    let audioBuffer;

    try {
      if (audioFile.data && audioFile.data.length > 0) {
        audioBuffer = audioFile.data;
      } else if (audioFile.tempFilePath) {
        audioBuffer = fs.readFileSync(audioFile.tempFilePath);
      } else {
        throw new Error("No audio data available");
      }
    } catch (fileError) {
      return res.status(400).json({
        error: `Unable to read audio file: ${fileError.message}`,
      });
    }

    const transcript = await safeAICall(
      () => transcribeAudio(audioBuffer),
      () => "Audio transcription unavailable, please try again.",
      "Voice transcription failed"
    );

    res.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
};

// 🎯 AI evaluates candidate answer
const aiResponse = async (req, res) => {
  try {
    const { transcript, currentQuestion, round, roundType, company, role } =
      req.body;

    const prompt = `You're a senior interviewer at ${company} evaluating a candidate for the ${role} position.

    Current question: ${currentQuestion}
    Candidate's answer: ${transcript}
    Round type: ${roundType}

    Evaluate the answer and decide:
    1. If the answer is complete and satisfactory, provide a score (1-10) and move to the next question
    2. If the answer needs more detail, ask a follow-up question
    3. If the round is complete, indicate round completion

    Return a JSON response with this structure:
    {
      "score": number,
      "feedback": "string",
      "nextQuestion": "string | null",
      "roundComplete": boolean,
      "aiResponse": "string"
    }`;

    const aiResponse = await safeAICall(
      () => gpt4oCall(prompt, 300),
      () =>
        JSON.stringify({
          score: 7,
          feedback: "Good answer, shows relevant experience",
          nextQuestion: null,
          roundComplete: true,
          aiResponse:
            "Thank you for that answer. Let's move to the next question.",
        }),
      "AI response generation failed"
    );

    let responseData;
    try {
      responseData = JSON.parse(aiResponse);
    } catch {
      responseData = {
        score: 7,
        feedback: "Good answer",
        nextQuestion: null,
        roundComplete: true,
        aiResponse: "Thank you for your answer.",
      };
    }

    res.json(responseData);
  } catch (error) {
    console.error("AI response error:", error);
    res.status(500).json({ error: "Failed to generate AI response" });
  }
};

// 🎯 Analyze video
const analyzeVideoFrame = async (req, res) => {
  try {
    const { videoFrame } = req.body;
    const analysis = await analyzeVideo(videoFrame);
    res.json({ analysis });
  } catch (error) {
    console.error("Video analysis error:", error);
    res.status(500).json({ error: "Failed to analyze video" });
  }
};

// 🎯 Complete interview + save report
const completeInterview = async (req, res) => {
  try {
    const { setupData, scores, duration, mediaPipeData, transcript } = req.body;

    const overallScore =
      scores.reduce((sum, score) => sum + score, 0) / scores.length;

    const feedbackPrompt = `Generate a comprehensive interview performance report for a candidate who interviewed for ${setupData.role} at ${setupData.company}.
    ... (same prompt as before) ...`;

    const feedbackResponse = await safeAICall(
      () => gpt4oCall(feedbackPrompt, 500),
      () =>
        JSON.stringify({
          overallScore,
          technicalScore: overallScore,
          behavioralScore: overallScore,
          communicationScore: overallScore,
          confidenceScore: mediaPipeData?.eyeContact || 5,
          strengths: ["Good technical knowledge", "Clear communication"],
          weaknesses: [
            "Could improve confidence",
            "Need more specific examples",
          ],
          recommendations: [
            "Practice more behavioral questions",
            "Work on confidence",
          ],
          readinessLevel:
            overallScore >= 8
              ? "Ready"
              : overallScore >= 6
              ? "Needs Improvement"
              : "Not Ready",
          nextSteps: ["Practice more interviews", "Review technical concepts"],
          companiesReady: ["Startups", "Mid-size companies"],
        }),
      "Feedback generation failed"
    );

    let feedbackData;
    try {
      feedbackData = JSON.parse(feedbackResponse);
    } catch {
      feedbackData = {
        overallScore,
        technicalScore: overallScore,
        behavioralScore: overallScore,
        communicationScore: overallScore,
        confidenceScore: 5,
        strengths: ["Good technical knowledge"],
        weaknesses: ["Could improve confidence"],
        recommendations: ["Practice more interviews"],
        readinessLevel: "Needs Improvement",
        nextSteps: ["Practice more interviews"],
        companiesReady: ["Startups"],
      };
    }

    const interviewReport = new InterviewReport({
      userId: setupData.candidateProfile?.userId || "temp-user",
      interviewId: "temp-interview-id",
      company: setupData.company,
      role: setupData.role,
      scores: {
        overall: feedbackData.overallScore,
        technical: feedbackData.technicalScore,
        behavioral: feedbackData.behavioralScore,
        communication: feedbackData.communicationScore,
        confidence: feedbackData.confidenceScore,
        problemSolving: overallScore,
      },
      recommendations: feedbackData.recommendations,
      transcript,
      faceAnalysis: {
        averageEyeContact: mediaPipeData?.eyeContact || 0,
        averageStress: mediaPipeData?.stress || 0,
        averagePosture: mediaPipeData?.posture || 0,
        averageDistraction: mediaPipeData?.distraction || 0,
        confidenceTrend: [mediaPipeData?.eyeContact || 0],
      },
      strengths: feedbackData.strengths,
      weaknesses: feedbackData.weaknesses,
      readinessScore: feedbackData.overallScore,
      readinessLevel: feedbackData.readinessLevel,
      nextSteps: feedbackData.nextSteps,
      companiesReady: feedbackData.companiesReady,
      totalDuration: Math.floor(duration / 60),
    });

    await interviewReport.save();

    res.json({
      success: true,
      report: interviewReport,
      message: "Interview completed successfully",
    });
  } catch (error) {
    console.error("Interview completion error:", error);
    res.status(500).json({ error: "Failed to complete interview" });
  }
};

// 🎯 Fetch interview history
const getInterviewHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    res.json({ interviews });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    res.status(500).json({ error: "Failed to fetch interview history" });
  }
};

// 🎯 Fetch report
const getInterviewReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await InterviewReport.findById(reportId);
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ report });
  } catch (error) {
    console.error("Error fetching interview report:", error);
    res.status(500).json({ error: "Failed to fetch interview report" });
  }
};

module.exports = {
  generateQuestion,
  generateVoiceResponse,
  transcribe,
  aiResponse,
  analyzeVideoFrame,
  completeInterview,
  getInterviewHistory,
  getInterviewReport,
};
