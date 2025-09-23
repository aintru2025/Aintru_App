// ExamStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  ExamStoreState, 
  ExamSession, 
  StartExamRequest,
  StartExamResponse,
  SubmitAnswersRequest,
  SubmitAnswersResponse,
  CompleteExamResponse,
  GenerateSummaryResponse,
  VideoFrameData,
  AddVideoFrameResponse,
  VideoMetricsResponse,
  BehavioralMetrics,
  Question
} from './exam';

const API_BASE_URL = 'http://localhost:3000/api';

const useExamStore = create<ExamStoreState>()(
  devtools(
    (set, get) => ({
      currentExam: null,
      examSessions: [],
      loading: false,
      error: null,
      currentQuestionIndex: 0,
      userAnswers: [],
      timeRemaining: null,
      isSubmitting: false,

      setLoading: (loading: boolean) => set({ loading }),
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),

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

      setCurrentQuestion: (index: number) => {
        const { currentExam } = get();
        if (currentExam && index >= 0 && index < currentExam.totalQuestions) {
          set({ currentQuestionIndex: index });
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
        const { currentQuestionIndex, currentExam } = get();
        if (currentExam && currentQuestionIndex < currentExam.totalQuestions - 1) {
          set({ currentQuestionIndex: currentQuestionIndex + 1 });
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

      getCurrentQuestion: (): Question | null => {
        const { currentExam, currentQuestionIndex } = get();
        if (currentExam?.questions?.[currentQuestionIndex]) {
          return currentExam.questions[currentQuestionIndex];
        }
        return null;
      },

      getProgress: (): number => {
        const { currentQuestionIndex, currentExam } = get();
        if (currentExam && currentExam.totalQuestions > 0) {
          return ((currentQuestionIndex + 1) / currentExam.totalQuestions) * 100;
        }
        return 0;
      },

      getAnsweredCount: (): number => {
        const { userAnswers } = get();
        return userAnswers.filter(answer => answer.trim() !== '').length;
      },

      isAllAnswered: (): boolean => {
        const { userAnswers, currentExam } = get();
        if (!currentExam) return false;
        return userAnswers.filter(answer => answer.trim() !== '').length === currentExam.totalQuestions;
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