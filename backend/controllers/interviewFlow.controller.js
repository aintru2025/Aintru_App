// controllers/interviewFlow.controller.js
const { gpt41Call } = require("../config/ai");

/**
 * POST /company-suggestions
 */
async function companySuggestions(req, res) {
  try {
    console.log("🏢 Company suggestions controller hit");
    const { query } = req.body;

    console.log("🔍 Query:", query);

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const prompt = `Given the search query "${query}", suggest 5-10 relevant companies that might be hiring. 
Return only a JSON array of company names, like:
["Company Name 1", "Company Name 2", "Company Name 3"]

Focus on companies that are well-known and likely to have job openings.`;

    console.log("🤖 Calling AI for company suggestions...");
    const aiResponse = await gpt41Call(prompt);
    console.log("✅ AI response received");

    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      suggestions = [
        "Google",
        "Microsoft",
        "Amazon",
        "Apple",
        "Meta",
        "Netflix",
        "Uber",
        "Airbnb",
        "Stripe",
        "Shopify",
      ].filter((company) =>
        company.toLowerCase().includes(query.toLowerCase())
      );
    }

    console.log("✅ Company suggestions generated:", suggestions);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("❌ Company suggestions error:", error);

    // Fallback response
    res.json({
      success: true,
      suggestions: [
        "Google",
        "Microsoft",
        "Amazon",
        "Apple",
        "Meta",
        "Netflix",
        "Uber",
        "Airbnb",
        "Stripe",
        "Shopify",
      ].filter((company) =>
        company.toLowerCase().includes((req.body.query || "").toLowerCase())
      ),
    });
  }
}

/**
 * POST /role-suggestions
 */
async function roleSuggestions(req, res) {
  try {
    console.log("💼 Role suggestions controller hit");
    const { query } = req.body;

    console.log("🔍 Query:", query);

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: [],
      });
    }

    const prompt = `Given the search query "${query}", suggest 10-15 relevant job roles/titles that might be available.
Return only a JSON array of role names.`;

    console.log("🤖 Calling AI for role suggestions...");
    const aiResponse = await gpt41Call(prompt);
    console.log("✅ AI response received");

    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      suggestions = [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "Product Manager",
        "DevOps Engineer",
        "QA Engineer",
        "UI/UX Designer",
        "Mobile Developer",
        "System Administrator",
        "Database Administrator",
        "Network Engineer",
        "Security Engineer",
        "Cloud Engineer",
        "Machine Learning Engineer",
      ].filter((role) => role.toLowerCase().includes(query.toLowerCase()));
    }

    console.log("✅ Role suggestions generated:", suggestions);

    res.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("❌ Role suggestions error:", error);

    // Fallback response
    res.json({
      success: true,
      suggestions: [
        "Software Engineer",
        "Frontend Developer",
        "Backend Developer",
        "Full Stack Developer",
        "Data Scientist",
        "Product Manager",
        "DevOps Engineer",
        "QA Engineer",
        "UI/UX Designer",
        "Mobile Developer",
        "System Administrator",
        "Database Administrator",
        "Network Engineer",
        "Security Engineer",
        "Cloud Engineer",
        "Machine Learning Engineer",
      ].filter((role) =>
        role.toLowerCase().includes((req.body.query || "").toLowerCase())
      ),
    });
  }
}

/**
 * POST /generate-exam-flow
 */
async function generateExamFlow(req, res) {
  console.log("🎓 Exam flow controller hit!");
  console.log("📝 Request body:", req.body);
  console.log("👤 User from token:", req.user);

  try {
    const { examName, examDescription } = req.body;
    console.log("🔄 Generating exam flow:", { examName, examDescription });

    if (!examName || examName.trim().length === 0) {
      console.log("❌ Missing exam name");
      return res.status(400).json({
        success: false,
        error: "Exam name is required",
      });
    }

    const trimmedExamName = examName.trim();
    const trimmedDescription = examDescription ? examDescription.trim() : "";

    const knownExams = [
      "GATE",
      "CAT",
      "UPSC",
      "GRE",
      "TOEFL",
      "IELTS",
      "GMAT",
      "SAT",
      "ACT",
      "JEE",
      "NEET",
      "CLAT",
      "AILET",
      "XAT",
      "SNAP",
      "NMAT",
      "IIFT",
      "SSC",
      "Banking",
      "Railway",
      "Defense",
      "Teaching",
      "Medical",
      "Engineering",
      "MBA",
      "PhD",
      "Research",
      "Academic",
      "Scholarship",
    ];

    const isKnownExam = knownExams.some(
      (exam) =>
        trimmedExamName.toLowerCase().includes(exam.toLowerCase()) ||
        exam.toLowerCase().includes(trimmedExamName.toLowerCase())
    );

    if (!isKnownExam) {
      console.log("❌ Exam not found:", trimmedExamName);
      return res.status(400).json({
        success: false,
        error: "Exam not found",
        message:
          "The exam you entered was not recognized. Please check the spelling and try again with the correct exam name.",
        suggestions: knownExams
          .filter((exam) =>
            exam
              .toLowerCase()
              .includes(trimmedExamName.toLowerCase().substring(0, 3))
          )
          .slice(0, 5),
      });
    }

    let interviewFlow;
    try {
      const prompt = `Generate a comprehensive interview flow for the exam: "${trimmedExamName}".
${trimmedDescription ? `Additional context: ${trimmedDescription}` : ""}

Create a realistic interview process that would be used for this exam preparation. Include:
1. Different rounds/types of interviews
2. Duration for each round
3. Description of what each round covers
4. Question types and focus areas

Return a JSON object with this structure:
{
  "examName": "${trimmedExamName}",
  "description": "Brief description of the exam",
  "rounds": [
    {
      "round": 1,
      "name": "Round Name",
      "type": "Technical/Behavioral/Academic/etc",
      "duration": "X mins",
      "description": "What this round covers",
      "questionType": "technical/behavioral/academic/etc",
      "focusAreas": ["Area 1", "Area 2", "Area 3"]
    }
  ],
  "totalDuration": 120,
  "difficulty": "Easy/Medium/Hard",
  "preparationTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Make it realistic and specific to the exam type.`;

      console.log("🤖 Calling AI for exam flow generation...");
      const aiResponse = await gpt41Call(prompt, 1000);
      console.log("✅ AI response received");

      try {
        interviewFlow = JSON.parse(aiResponse);

        if (!interviewFlow.rounds || !Array.isArray(interviewFlow.rounds)) {
          throw new Error("Invalid AI response structure");
        }

        if (!interviewFlow.totalDuration) {
          interviewFlow.totalDuration = interviewFlow.rounds.reduce(
            (total, round) => {
              const durationStr = round.duration || "30 mins";
              const minutesMatch = durationStr.match(/(\d+)/);
              return total + (minutesMatch ? parseInt(minutesMatch[1]) : 30);
            },
            0
          );
        }

        console.log("✅ AI-generated exam flow parsed successfully");
      } catch (parseError) {
        console.error("❌ AI response parsing error:", parseError);
        throw new Error("Failed to parse AI response");
      }
    } catch (aiError) {
      console.error("❌ AI generation error:", aiError);
      interviewFlow = generateFallbackExamFlow(
        trimmedExamName,
        trimmedDescription
      );
    }

    console.log("✅ Exam flow created successfully");

    res.json({
      success: true,
      interviewFlow,
      message: "Exam interview flow generated successfully",
    });
  } catch (error) {
    console.error("❌ Exam flow generation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate exam interview flow",
      message:
        "An error occurred while generating the interview flow. Please try again.",
      fallback: {
        examName: req.body.examName || "Unknown Exam",
        description: "General exam preparation interview",
        rounds: [
          {
            round: 1,
            name: "Academic Assessment",
            type: "Academic",
            duration: "45 mins",
            description: "Subject knowledge and academic skills assessment",
            questionType: "academic",
            focusAreas: [
              "Core subjects",
              "Problem solving",
              "Analytical thinking",
            ],
          },
          {
            round: 2,
            name: "General Knowledge",
            type: "General",
            duration: "30 mins",
            description: "General awareness and current affairs",
            questionType: "general",
            focusAreas: ["Current events", "General knowledge", "Aptitude"],
          },
        ],
        totalDuration: 75,
        difficulty: "Medium",
        preparationTips: [
          "Review core subject materials",
          "Stay updated with current affairs",
          "Practice previous year questions",
          "Focus on time management",
        ],
      },
    });
  }
}

/**
 * Helper: fallback exam flows
 */
function generateFallbackExamFlow(examName, description) {
  const examLower = examName.toLowerCase();

  if (examLower.includes("gate")) {
    return {
      examName,
      description: "Graduate Aptitude Test in Engineering preparation",
      rounds: [
        {
          round: 1,
          name: "Technical Subject Assessment",
          type: "Technical",
          duration: "60 mins",
          description: "Core engineering subject knowledge and problem-solving",
          questionType: "technical",
          focusAreas: [
            "Mathematics",
            "Engineering Mathematics",
            "Core Subject",
            "Problem Solving",
          ],
        },
        {
          round: 2,
          name: "Aptitude & Reasoning",
          type: "Aptitude",
          duration: "30 mins",
          description:
            "Verbal ability, numerical ability, and logical reasoning",
          questionType: "aptitude",
          focusAreas: [
            "Verbal Ability",
            "Numerical Ability",
            "Logical Reasoning",
            "Data Interpretation",
          ],
        },
        {
          round: 3,
          name: "General Awareness",
          type: "General",
          duration: "15 mins",
          description: "Current affairs and general knowledge",
          questionType: "general",
          focusAreas: [
            "Current Events",
            "Science & Technology",
            "History",
            "Geography",
          ],
        },
      ],
      totalDuration: 105,
      difficulty: "Hard",
      preparationTips: [
        "Master core engineering subjects thoroughly",
        "Practice previous year GATE papers",
        "Focus on time management during preparation",
        "Join study groups for peer learning",
        "Take regular mock tests",
      ],
    };
  }

  if (examLower.includes("cat")) {
    return {
      examName,
      description: "Common Admission Test for MBA preparation",
      rounds: [
        {
          round: 1,
          name: "Quantitative Ability",
          type: "Quantitative",
          duration: "40 mins",
          description: "Mathematical problem solving and data interpretation",
          questionType: "quantitative",
          focusAreas: [
            "Arithmetic",
            "Algebra",
            "Geometry",
            "Data Interpretation",
          ],
        },
        {
          round: 2,
          name: "Verbal Ability & Reading Comprehension",
          type: "Verbal",
          duration: "40 mins",
          description: "English language skills and reading comprehension",
          questionType: "verbal",
          focusAreas: [
            "Reading Comprehension",
            "Grammar",
            "Vocabulary",
            "Para Jumbles",
          ],
        },
        {
          round: 3,
          name: "Logical Reasoning & Data Interpretation",
          type: "Logical",
          duration: "40 mins",
          description: "Logical reasoning and data analysis",
          questionType: "logical",
          focusAreas: [
            "Logical Reasoning",
            "Data Sufficiency",
            "Puzzles",
            "Arrangements",
          ],
        },
      ],
      totalDuration: 120,
      difficulty: "Hard",
      preparationTips: [
        "Practice mental math and shortcuts",
        "Read newspapers daily for vocabulary",
        "Solve puzzles and brain teasers",
        "Take sectional and full-length mock tests",
        "Focus on accuracy over speed initially",
      ],
    };
  }

  if (examLower.includes("upsc")) {
    return {
      examName,
      description: "Union Public Service Commission examination preparation",
      rounds: [
        {
          round: 1,
          name: "Preliminary Examination",
          type: "Objective",
          duration: "60 mins",
          description: "General Studies and CSAT preparation",
          questionType: "objective",
          focusAreas: [
            "History",
            "Geography",
            "Polity",
            "Economics",
            "Science & Technology",
          ],
        },
        {
          round: 2,
          name: "Mains Examination",
          type: "Descriptive",
          duration: "90 mins",
          description: "Essay writing and detailed answer preparation",
          questionType: "descriptive",
          focusAreas: [
            "Essay Writing",
            "Answer Writing",
            "Current Affairs",
            "Optional Subject",
          ],
        },
        {
          round: 3,
          name: "Personality Test",
          type: "Interview",
          duration: "45 mins",
          description: "Personality assessment and current affairs discussion",
          questionType: "interview",
          focusAreas: [
            "Personality",
            "Current Affairs",
            "Hobbies",
            "Academic Background",
          ],
        },
      ],
      totalDuration: 195,
      difficulty: "Very Hard",
      preparationTips: [
        "Read NCERT books thoroughly",
        "Stay updated with current affairs daily",
        "Practice answer writing regularly",
        "Develop a balanced personality",
        "Join test series for regular assessment",
      ],
    };
  }

  return {
    examName,
    description: description || "General exam preparation interview",
    rounds: [
      {
        round: 1,
        name: "Subject Knowledge",
        type: "Academic",
        duration: "45 mins",
        description: "Core subject knowledge assessment",
        questionType: "academic",
        focusAreas: [
          "Core subjects",
          "Problem solving",
          "Conceptual understanding",
        ],
      },
      {
        round: 2,
        name: "General Aptitude",
        type: "Aptitude",
        duration: "30 mins",
        description: "General aptitude and reasoning skills",
        questionType: "aptitude",
        focusAreas: [
          "Logical reasoning",
          "Numerical ability",
          "Verbal ability",
        ],
      },
      {
        round: 3,
        name: "Current Affairs",
        type: "General",
        duration: "15 mins",
        description: "Current events and general awareness",
        questionType: "general",
        focusAreas: [
          "Current events",
          "General knowledge",
          "Recent developments",
        ],
      },
    ],
    totalDuration: 90,
    difficulty: "Medium",
    preparationTips: [
      "Master the core subjects thoroughly",
      "Practice previous year questions",
      "Stay updated with current affairs",
      "Take regular mock tests",
      "Focus on time management",
    ],
  };
}

/**
 * POST /generate-interview-flow
 */
async function generateInterviewFlow(req, res) {
  console.log("🎯 Interview flow controller hit!");
  console.log("📝 Request body:", req.body);
  console.log("👤 User from token:", req.user);

  try {
    const { company, role, experience, expectedCTC, candidateProfileId } =
      req.body;

    console.log("🔄 Generating interview flow:", {
      company,
      role,
      experience,
      expectedCTC,
      candidateProfileId,
    });

    if (!company || !role || !experience) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        error: "Company, role, and experience are required",
      });
    }

    const interviewFlow = {
      company: company.trim(),
      role: role.trim(),
      experienceLevel: experience.toString(),
      expectedCTC: expectedCTC || "Not specified",
      rounds: [
        {
          round: 1,
          name: "Technical Assessment",
          type: "Technical",
          duration: "45 mins",
          questionType: "technical",
          description: "Technical skills and problem-solving assessment",
        },
        {
          round: 2,
          name: "Behavioral Interview",
          type: "Behavioral",
          duration: "30 mins",
          questionType: "behavioral",
          description: "Behavioral and situational questions",
        },
        {
          round: 3,
          name: "HR Discussion",
          type: "HR",
          duration: "20 mins",
          questionType: "hr",
          description: "Final HR and culture fit discussion",
        },
      ],
      totalDuration: 95,
      difficulty: "Medium",
    };

    console.log("✅ Interview flow created successfully");

    res.json({
      success: true,
      interviewFlow,
      message: "Interview flow generated successfully",
    });
  } catch (error) {
    console.error("❌ Interview flow generation error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate interview flow",
      fallback: {
        rounds: [
          {
            round: 1,
            type: "Technical",
            duration: "45 mins",
            questionType: "technical",
            description: "Technical skills assessment",
          },
          {
            round: 2,
            type: "Behavioral",
            duration: "30 mins",
            questionType: "behavioral",
            description: "Behavioral questions",
          },
        ],
      },
    });
  }
}

module.exports = {
  companySuggestions,
  roleSuggestions,
  generateExamFlow,
  generateInterviewFlow,
};
