// exam.ts
export interface Question {
  question: string;
  userAnswer?: string;
  isCorrect?: boolean | null;
  answeredAt?: Date;
  timeTakenSec?: number;
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
  examType: string;
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

export interface StartExamRequest {
  examType: string;
}

export interface StartExamResponse {
  message: string;
  session: ExamSession;
}

export interface SubmitAnswersRequest {
  answers: string[];
}

export interface SubmitAnswersResponse {
  message: string;
  isCompleted: boolean;
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
  examSessions: ExamSession[];
  loading: boolean;
  error: string | null;
  currentQuestionIndex: number;
  userAnswers: string[];
  timeRemaining: number | null;
  isSubmitting: boolean;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  startExam: (examType: string, authToken: string) => Promise<ExamSession>;
  setCurrentQuestion: (index: number) => void;
  updateAnswer: (questionIndex: number, answer: string) => void;
  submitAnswers: (sessionId: string, authToken: string) => Promise<SubmitAnswersResponse>;
  completeExam: (sessionId: string, authToken: string) => Promise<ExamSession>;
  generateSummary: (sessionId: string, authToken: string) => Promise<ExamSession>;
  addVideoFrame: (sessionId: string, frameData: VideoFrameData) => Promise<AddVideoFrameResponse | void>;
  getVideoMetrics: (sessionId: string) => Promise<BehavioralMetrics>;
  updateTimer: () => void;
  setTimeRemaining: (time: number) => void;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  resetExam: () => void;
  getCurrentQuestion: () => Question | null;
  getProgress: () => number;
  getAnsweredCount: () => number;
  isAllAnswered: () => boolean;
  getFormattedTime: () => string;
}