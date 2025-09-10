export interface InterviewRound {
  name: string;
  duration: number; // in minutes
  questionTypes: string[];
  description: string;
}

export interface CompanyConfig {
  name: string;
  rounds: InterviewRound[];
  strictness: 'Low' | 'Medium' | 'High' | 'Very High';
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard';
  specialNotes: string[];
}

export interface RoleConfig {
  [role: string]: CompanyConfig;
}

export interface CompanyInterviewConfig {
  [company: string]: RoleConfig;
}

export const INTERVIEW_CONFIG: CompanyInterviewConfig = {
  "amazon": {
    "SDE": {
      name: "Amazon SDE Interview",
      rounds: [
        {
          name: "Online Assessment",
          duration: 60,
          questionTypes: ["Coding", "DSA"],
          description: "Algorithm and data structure problems"
        },
        {
          name: "Technical Round 1",
          duration: 45,
          questionTypes: ["Coding", "System Design"],
          description: "Coding problems and basic system design"
        },
        {
          name: "Technical Round 2",
          duration: 45,
          questionTypes: ["Coding", "System Design", "Leadership Principles"],
          description: "Advanced coding and leadership principles"
        },
        {
          name: "Bar Raiser",
          duration: 60,
          questionTypes: ["Behavioral", "Leadership Principles", "Technical"],
          description: "Final round with senior engineer"
        }
      ],
      strictness: "High",
      difficulty: "Medium-High",
      specialNotes: [
        "Focus on Leadership Principles",
        "Emphasize customer obsession",
        "Expect behavioral questions in every round"
      ]
    },
    "PM": {
      name: "Amazon Product Manager Interview",
      rounds: [
        {
          name: "Written Exercise",
          duration: 30,
          questionTypes: ["Case Study", "Product Design"],
          description: "Product design and case study problems"
        },
        {
          name: "Product Round 1",
          duration: 45,
          questionTypes: ["Product Design", "Case Study", "Leadership Principles"],
          description: "Product design and leadership principles"
        },
        {
          name: "Product Round 2",
          duration: 45,
          questionTypes: ["Case Study", "Behavioral", "Leadership Principles"],
          description: "Advanced case studies and behavioral questions"
        },
        {
          name: "Bar Raiser",
          duration: 60,
          questionTypes: ["Behavioral", "Leadership Principles", "Product Strategy"],
          description: "Final round with senior PM"
        }
      ],
      strictness: "High",
      difficulty: "Medium-High",
      specialNotes: [
        "Focus on Leadership Principles",
        "Emphasize customer obsession",
        "Expect case studies in every round"
      ]
    }
  },
  "google": {
    "SWE": {
      name: "Google Software Engineer Interview",
      rounds: [
        {
          name: "Phone Screen",
          duration: 45,
          questionTypes: ["Coding", "DSA"],
          description: "Algorithm and data structure problems"
        },
        {
          name: "Coding Round 1",
          duration: 45,
          questionTypes: ["Coding", "DSA"],
          description: "Advanced algorithm problems"
        },
        {
          name: "Coding Round 2",
          duration: 45,
          questionTypes: ["Coding", "System Design"],
          description: "Coding and basic system design"
        },
        {
          name: "System Design",
          duration: 60,
          questionTypes: ["System Design", "Architecture"],
          description: "Large-scale system design"
        },
        {
          name: "Googliness",
          duration: 45,
          questionTypes: ["Behavioral", "Culture Fit"],
          description: "Behavioral and culture fit questions"
        }
      ],
      strictness: "Very High",
      difficulty: "High",
      specialNotes: [
        "Focus on algorithm optimization",
        "Emphasize clean code",
        "Expect high coding standards"
      ]
    }
  },
  "microsoft": {
    "SDE": {
      name: "Microsoft Software Engineer Interview",
      rounds: [
        {
          name: "Phone Screen",
          duration: 45,
          questionTypes: ["Coding", "DSA"],
          description: "Algorithm and data structure problems"
        },
        {
          name: "Technical Round 1",
          duration: 45,
          questionTypes: ["Coding", "System Design"],
          description: "Coding and system design"
        },
        {
          name: "Technical Round 2",
          duration: 45,
          questionTypes: ["Coding", "Behavioral"],
          description: "Coding and behavioral questions"
        },
        {
          name: "Final Round",
          duration: 60,
          questionTypes: ["Behavioral", "Technical", "Culture Fit"],
          description: "Final technical and behavioral assessment"
        }
      ],
      strictness: "High",
      difficulty: "Medium-High",
      specialNotes: [
        "Focus on problem-solving approach",
        "Emphasize collaboration",
        "Expect behavioral questions"
      ]
    }
  },
  "meta": {
    "PM": {
      name: "Meta Product Manager Interview",
      rounds: [
        {
          name: "Product Design",
          duration: 45,
          questionTypes: ["Product Design", "Case Study"],
          description: "Product design and case study problems"
        },
        {
          name: "Analytics Round",
          duration: 45,
          questionTypes: ["Analytics", "Case Study"],
          description: "Data analysis and case studies"
        },
        {
          name: "Behavioral Round",
          duration: 45,
          questionTypes: ["Behavioral", "Leadership"],
          description: "Behavioral and leadership questions"
        },
        {
          name: "Final Round",
          duration: 60,
          questionTypes: ["Product Strategy", "Behavioral", "Case Study"],
          description: "Final product strategy and behavioral assessment"
        }
      ],
      strictness: "High",
      difficulty: "Medium-High",
      specialNotes: [
        "Focus on data-driven decisions",
        "Emphasize user impact",
        "Expect case studies in every round"
      ]
    }
  }
};

export const getInterviewConfig = (company: string, role: string): CompanyConfig | null => {
  return INTERVIEW_CONFIG[company.toLowerCase()]?.[role] || null;
};

export const getAvailableCompanies = (): string[] => {
  return Object.keys(INTERVIEW_CONFIG);
};

export const getAvailableRoles = (company: string): string[] => {
  return Object.keys(INTERVIEW_CONFIG[company.toLowerCase()] || {});
}; 