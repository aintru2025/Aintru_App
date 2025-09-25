// ExamStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ExamStoreState, 
  ExamSession, 
  InterviewSession,
  StartExamRequest,
  StartExamResponse,
  StartInterviewRequest,
  StartInterviewResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  CompleteExamResponse,
  GenerateSummaryResponse,
  VideoFrameData,
  AddVideoFrameResponse,
  VideoMetricsResponse,
  BehavioralMetrics,
  Question,
  Round
} from './exam';

const API_BASE_URL = 'http://localhost:3000/api';

const useExamStore = create<ExamStoreState>()(
  devtools(
    (set, get) => ({
      currentExam: null,
      currentInterview: null,
      examSessions: [],
      interviewSessions: [],
      loading: false,
      error: null,
      currentQuestionIndex: 0,
      currentRoundIndex: 0,
      userAnswers: [],
      timeRemaining: null,
      isSubmitting: false,

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

      // Existing exam methods
      startExam: async (examType: string, authToken: string): Promise<ExamSession> => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE_URL}/exam/start`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ examType } as StartExamRequest)
          });

          if (!response.ok) {
            throw new Error('Failed to start exam');
          }

          const data: StartExamResponse = await response.json();
          
          set({
            currentExam: data.session,
            currentQuestionIndex: 0,
            userAnswers: new Array(data.session.totalQuestions).fill(''),
            timeRemaining: data.session.timeLimit * 60,
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // New interview methods
      startInterview: async (company: string, role: string, experience: string, authToken?: string): Promise<InterviewSession> => {
        set({ loading: true, error: null });
        
        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/interview/start`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ company, role, experience } as StartInterviewRequest)
          });

          if (!response.ok) {
            throw new Error('Failed to start interview');
          }

          const data: StartInterviewResponse = await response.json();
          
          if (!data.success) {
            throw new Error('Interview start failed');
          }

          // Initialize answers for all questions across all rounds
          const totalQuestions = data.session.rounds.reduce((total, round) => total + round.questions.length, 0);
          
          set({
            currentInterview: data.session,
            currentRoundIndex: 0,
            currentQuestionIndex: 0,
            userAnswers: new Array(totalQuestions).fill(''),
            timeRemaining: data.session.totalDuration * 60,
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      setCurrentRound: (roundIndex: number) => {
        const { currentInterview } = get();
        if (currentInterview && roundIndex >= 0 && roundIndex < currentInterview.rounds.length) {
          set({ 
            currentRoundIndex: roundIndex,
            currentQuestionIndex: 0 // Reset to first question of the round
          });
        }
      },

      getCurrentRound: (): Round | null => {
        const { currentInterview, currentRoundIndex } = get();
        if (currentInterview?.rounds?.[currentRoundIndex]) {
          return currentInterview.rounds[currentRoundIndex];
        }
        return null;
      },

      submitRoundAnswers: async (sessionId: string, roundIndex: number, answers: string[], authToken?: string): Promise<any> => {
        set({ isSubmitting: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/interview/${sessionId}/round/${roundIndex}/answers`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ answers })
          });

          if (!response.ok) {
            throw new Error('Failed to submit round answers');
          }

          const data = await response.json();
          set({ isSubmitting: false });
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      completeInterview: async (sessionId: string, authToken?: string): Promise<InterviewSession> => {
        set({ loading: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/interview/${sessionId}/complete`, {
            method: 'POST',
            headers
          });

          if (!response.ok) {
            throw new Error('Failed to complete interview');
          }

          const data = await response.json();
          
          set({
            currentInterview: { ...get().currentInterview!, isCompleted: true },
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      setCurrentQuestion: (index: number) => {
        const { currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam && index >= 0 && index < currentExam.totalQuestions) {
          set({ currentQuestionIndex: index });
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound && index >= 0 && index < currentRound.questions.length) {
            set({ currentQuestionIndex: index });
          }
        }
      },

      updateAnswer: (questionIndex: number, answer: string) => {
        const { userAnswers } = get();
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = answer;
        set({ userAnswers: newAnswers });
      },

      submitAnswers: async (sessionId: string, authToken: string): Promise<SubmitAnswersResponse> => {
        const { userAnswers } = get();
        set({ isSubmitting: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/exam/${sessionId}/answers`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ answers: userAnswers } as SubmitAnswersRequest)
          });

          if (!response.ok) {
            throw new Error('Failed to submit answers');
          }

          const data: SubmitAnswersResponse = await response.json();
          
          set({
            isSubmitting: false,
            currentExam: get().currentExam ? { ...get().currentExam!, isCompleted: true } : null
          });

          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      completeExam: async (sessionId: string, authToken: string): Promise<ExamSession> => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/exam/${sessionId}/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to complete exam');
          }

          const data: CompleteExamResponse = await response.json();
          
          set({
            currentExam: data.session,
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      generateSummary: async (sessionId: string, authToken: string): Promise<ExamSession> => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/exam/${sessionId}/summary`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            }
          });

          if (!response.ok) {
            throw new Error('Failed to generate summary');
          }

          const data: GenerateSummaryResponse = await response.json();
          
          set({
            currentExam: { ...get().currentExam!, summary: data.session.summary },
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      addVideoFrame: async (sessionId: string, frameData: VideoFrameData): Promise<AddVideoFrameResponse | void> => {
        try {
          const response = await fetch(`${API_BASE_URL}/exam/${sessionId}/video-frame`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(frameData)
          });

          if (!response.ok) {
            throw new Error('Failed to add video frame');
          }

          return await response.json() as AddVideoFrameResponse;
        } catch (error) {
          console.error('Video frame error:', error);
        }
      },

      getVideoMetrics: async (sessionId: string): Promise<BehavioralMetrics> => {
        set({ loading: true, error: null });

        try {
          const response = await fetch(`${API_BASE_URL}/exam/${sessionId}/metrics`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to get video metrics');
          }

          const data: VideoMetricsResponse = await response.json();
          set({ loading: false });
          
          return data.metrics;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      updateTimer: () => {
        const { timeRemaining } = get();
        if (timeRemaining && timeRemaining > 0) {
          set({ timeRemaining: timeRemaining - 1 });
        }
      },

      setTimeRemaining: (time: number) => set({ timeRemaining: time }),

      goToNextQuestion: () => {
        const { currentQuestionIndex, currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam && currentQuestionIndex < currentExam.totalQuestions - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound && currentQuestionIndex < currentRound.questions.length - 1) {
            set({ currentQuestionIndex: currentQuestionIndex + 1 });
          }
        }
      },

      goToPreviousQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
          set({ currentQuestionIndex: currentQuestionIndex - 1 });
        }
      },

      resetExam: () => set({
        currentExam: null,
        currentQuestionIndex: 0,
        userAnswers: [],
        timeRemaining: null,
        error: null,
        loading: false,
        isSubmitting: false
      }),

      resetInterview: () => set({
        currentInterview: null,
        currentRoundIndex: 0,
        currentQuestionIndex: 0,
        userAnswers: [],
        timeRemaining: null,
        error: null,
        loading: false,
        isSubmitting: false
      }),

      getCurrentQuestion: (): Question | null => {
        const { currentExam, currentInterview, currentQuestionIndex, currentRoundIndex } = get();
        
        if (currentExam?.questions?.[currentQuestionIndex]) {
          return currentExam.questions[currentQuestionIndex];
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound?.questions?.[currentQuestionIndex]) {
            return currentRound.questions[currentQuestionIndex];
          }
        }
        return null;
      },

      getProgress: (): number => {
        const { currentQuestionIndex, currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam && currentExam.totalQuestions > 0) {
          return ((currentQuestionIndex + 1) / currentExam.totalQuestions) * 100;
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound && currentRound.questions.length > 0) {
            return ((currentQuestionIndex + 1) / currentRound.questions.length) * 100;
          }
        }
        return 0;
      },

      getAnsweredCount: (): number => {
        const { userAnswers } = get();
        return userAnswers.filter(answer => answer.trim() !== '').length;
      },

      isAllAnswered: (): boolean => {
        const { userAnswers, currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam) {
          return userAnswers.filter(answer => answer.trim() !== '').length === currentExam.totalQuestions;
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound) {
            const roundStartIndex = currentInterview.rounds
              .slice(0, currentRoundIndex)
              .reduce((acc, round) => acc + round.questions.length, 0);
            const roundAnswers = userAnswers.slice(roundStartIndex, roundStartIndex + currentRound.questions.length);
            return roundAnswers.filter(answer => answer.trim() !== '').length === currentRound.questions.length;
          }
        }
        return false;
      },

      getFormattedTime: (): string => {
        const { timeRemaining } = get();
        if (timeRemaining === null) return '00:00';
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }),
    { name: 'exam-store' }
  )
);

export default useExamStore;