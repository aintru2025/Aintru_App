// exam.ts - Updated interfaces
export interface Question {
  question: string;
  userAnswer?: string;
  score?: number | null;
  feedback?: string;
  isCorrect?: boolean | null;
  answeredAt?: Date;
  timeTakenSec?: number;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Round {
  round: number;
  name: string;
  type: string;
  duration: number;
  description: string;
  questions: Question[];
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoAnalysis {
  timestamp: Date;
  faceDetected: boolean;
  numFaces: number;
  emotions: {
    happy: number;
    sad: number;
    neutral: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  };
}

export interface BehavioralMetrics {
  framesCount: number;
  presencePct: number;
  multipleFacesPct: number;
  avgEmotions?: {
    happy: number;
    sad: number;
    neutral: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  };
}

export interface ExamSession {
  _id: string;
  userId: string;
  examType?: string;
  company?: string;
  role?: string;
  candidateProfileId?: string | null;
  rounds?: Round[];
  totalRounds?: number;
  totalDuration?: number;
  questions: Question[];
  currentIndex: number;
  totalQuestions: number;
  timeLimit: number;
  isCompleted: boolean;
  summary?: string;
  videoAnalysis: VideoAnalysis[];
  behavioralMetrics?: BehavioralMetrics;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface InterviewSession {
  userId: string;
  company: string;
  role: string;
  candidateProfileId?: string | null;
  rounds: Round[];
  totalRounds: number;
  totalDuration: number;
  isCompleted: boolean;
  summary: string;
  _id: string;
  videoAnalysis: VideoAnalysis[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  behavioralMetrics?: BehavioralMetrics;
}

export interface StartExamRequest {
  examType: string;
}

export interface StartExamResponse {
  message: string;
  session: ExamSession;
}

export interface StartInterviewRequest {
  company: string;
  role: string;
  experience: string;
}

export interface StartInterviewResponse {
  success: boolean;
  session: InterviewSession;
}

export interface SubmitAnswersRequest {
  answers: string[];
}

export interface SubmitAnswersResponse {
  message: string;
  isCompleted: boolean;
}

// New interfaces for interview answer submission
export interface SingleAnswerRequest {
  roundIndex: number;
  questionIndex: number;
  answer: string;
}

export interface SingleAnswerResponse {
  message: string;
  session: InterviewSession;
}

export interface MultipleAnswersRequest {
  answers: Array<{
    roundIndex: number;
    questionIndex: number;
    answer: string;
  }>;
}

export interface MultipleAnswersResponse {
  message: string;
  session: InterviewSession;
}

export interface CompleteExamResponse {
  message: string;
  session: ExamSession;
}

export interface GenerateSummaryResponse {
  message: string;
  session: ExamSession;
}

export interface VideoFrameData {
  timestamp: string;
  faceDetected: boolean;
  numFaces: number;
  emotions: {
    happy: number;
    sad: number;
    neutral: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  };
}

export interface AddVideoFrameResponse {
  message: string;
  sessionId: string;
}

export interface VideoMetricsResponse {
  message: string;
  metrics: BehavioralMetrics;
}

export interface ExamStoreState {
  currentExam: ExamSession | null;
  currentInterview: InterviewSession | null;
  examSessions: ExamSession[];
  interviewSessions: InterviewSession[];
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  currentRoundIndex: number;
  userAnswers: string[];
  timeRemaining: number | null;
  isSubmitting: boolean;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Existing exam methods
  startExam: (examType: string, authToken: string) => Promise<ExamSession>;
  setCurrentQuestion: (index: number) => void;
  updateAnswer: (questionIndex: number, answer: string) => void;
  submitAnswers: (sessionId: string, authToken: string) => Promise<SubmitAnswersResponse>;
  completeExam: (sessionId: string, authToken: string) => Promise<ExamSession>;
  generateSummary: (sessionId: string, authToken: string) => Promise<ExamSession>;
  
  // Interview methods
  startInterview: (company: string, role: string, experience: string, authToken?: string) => Promise<InterviewSession>;
  setCurrentRound: (roundIndex: number) => void;
  getCurrentRound: () => Round | null;
  submitRoundAnswers: (sessionId: string, roundIndex: number, answers: string[], authToken?: string) => Promise<any>;
  completeInterview: (sessionId: string, authToken?: string) => Promise<InterviewSession>;
  
  // New interview answer submission methods
  submitSingleAnswer: (sessionId: string, roundIndex: number, questionIndex: number, answer: string, authToken?: string) => Promise<SingleAnswerResponse>;
  submitMultipleAnswers: (sessionId: string, answers: Array<{ roundIndex: number; questionIndex: number; answer: string }>, authToken?: string) => Promise<MultipleAnswersResponse>;
  updateInterviewAnswer: (roundIndex: number, questionIndex: number, answer: string) => void;
  
  // Video and metrics methods
  addVideoFrame: (sessionId: string, frameData: VideoFrameData) => Promise<AddVideoFrameResponse | void>;
  getVideoMetrics: (sessionId: string) => Promise<BehavioralMetrics>;
  
  // Timer and navigation methods
  updateTimer: () => void;
  setTimeRemaining: (time: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  resetExam: () => void;
  resetInterview: () => void;
  
  // Utility methods
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
  getAnsweredCount: () => number;
  isAllAnswered: () => boolean;
  getFormattedTime: () => string;
}