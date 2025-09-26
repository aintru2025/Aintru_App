// ExamStore.ts - Fixed version with proper validations and state management
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

// New interfaces for the evaluation and summary endpoints
interface EvaluateInterviewResponse {
  success: boolean;
  message: string;
  session: InterviewSession;
}

interface GenerateInterviewSummaryResponse {
  success: boolean;
  message: string;
  session: InterviewSession;
}

// Extended interface for the store state with proper validations
interface ExtendedExamStoreState extends ExamStoreState {
  // New methods for interview evaluation and summary
  evaluateInterview: (sessionId: string, authToken?: string) => Promise<InterviewSession>;
  generateInterviewSummary: (sessionId: string, authToken?: string) => Promise<InterviewSession>;
  // New validation methods
  isRoundComplete: (roundIndex: number) => boolean;
  canNavigateToRound: (roundIndex: number) => boolean;
  getOverallProgress: () => number;
  getCurrentRoundAnswers: () => string[];
}

const useExamStore = create<ExtendedExamStoreState>()(
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
            currentRoundIndex: 0,
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

      // FIXED: Updated interview methods with proper initialization
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
            const errorText = await response.text();
            throw new Error(`Failed to start interview: ${errorText}`);
          }

          const data: StartInterviewResponse = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Interview start failed');
          }

          // Initialize answers for all questions across all rounds
          const totalQuestions = data.session.rounds.reduce((total, round) => total + round.questions.length, 0);
          
          set({
            currentInterview: data.session,
            currentRoundIndex: 0,
            currentQuestionIndex: 0,
            userAnswers: new Array(totalQuestions).fill(''),
            timeRemaining: data.session.totalDuration * 60,
            loading: false,
            error: null
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // NEW: Evaluate interview method with better error handling
      evaluateInterview: async (sessionId: string, authToken?: string): Promise<InterviewSession> => {
        set({ loading: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/interview/${sessionId}/evaluate`, {
            method: 'POST',
            headers
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to evaluate interview: ${errorText}`);
          }

          const data: EvaluateInterviewResponse = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Interview evaluation failed');
          }

          // Update the current interview session with evaluated data
          set({
            currentInterview: data.session,
            loading: false
          });

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // NEW: Generate interview summary method with better error handling
      generateInterviewSummary: async (sessionId: string, authToken?: string): Promise<InterviewSession> => {
        set({ loading: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/interview/${sessionId}/summary`, {
            method: 'POST',
            headers
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to generate interview summary: ${errorText}`);
          }

          const data: GenerateInterviewSummaryResponse = await response.json();
          
          if (!data.success) {
            throw new Error(data.message || 'Interview summary generation failed');
          }

          // Update the current interview session with summary
          const currentInterview = get().currentInterview;
          if (currentInterview) {
            set({
              currentInterview: { ...currentInterview, summary: data.session.summary },
              loading: false
            });
          }

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // FIXED: Better error handling for answer submission
      submitSingleAnswer: async (sessionId: string, roundIndex: number, questionIndex: number, answer: string, authToken?: string): Promise<any> => {
        set({ isSubmitting: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/${sessionId}/answer`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ roundIndex, questionIndex, answer })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit answer: ${errorText}`);
          }

          const data = await response.json();
          
          // Update the current interview session with the returned data
          if (data.session) {
            set({ currentInterview: data.session });
          }
          
          set({ isSubmitting: false });
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      // FIXED: Multiple answers submission with better error handling
      submitMultipleAnswers: async (sessionId: string, answers: Array<{ roundIndex: number; questionIndex: number; answer: string }>, authToken?: string): Promise<any> => {
        set({ isSubmitting: true, error: null });

        try {
          const headers: Record<string, string> = {
            'Content-Type': 'application/json'
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          const response = await fetch(`${API_BASE_URL}/job/${sessionId}/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ answers })
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to submit answers: ${errorText}`);
          }

          const data = await response.json();
          
          // Update the current interview session with the returned data
          if (data.session) {
            set({ currentInterview: data.session });
          }
          
          set({ isSubmitting: false });
          return data;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, isSubmitting: false });
          throw error;
        }
      },

      // FIXED: Round navigation with proper validation
      setCurrentRound: (roundIndex: number) => {
        const { currentInterview, canNavigateToRound } = get();
        
        if (!currentInterview) {
          console.error('No active interview session');
          return;
        }
        
        if (roundIndex < 0 || roundIndex >= currentInterview.rounds.length) {
          console.error('Invalid round index:', roundIndex);
          return;
        }

        // Check if user can navigate to this round (sequential completion required)
        if (!canNavigateToRound(roundIndex)) {
          set({ error: `Please complete previous rounds before accessing Round ${roundIndex + 1}` });
          return;
        }

        set({ 
          currentRoundIndex: roundIndex,
          currentQuestionIndex: 0,
          error: null
        });
      },

      // NEW: Check if user can navigate to a specific round
      canNavigateToRound: (targetRoundIndex: number): boolean => {
        const { currentInterview, currentRoundIndex, isRoundComplete } = get();
        
        if (!currentInterview) return false;
        
        // Can always go to current round or previous completed rounds
        if (targetRoundIndex <= currentRoundIndex) {
          return true;
        }
        
        // Can only go to next round if current round is complete
        if (targetRoundIndex === currentRoundIndex + 1 && isRoundComplete(currentRoundIndex)) {
          return true;
        }
        
        // Otherwise, check if all previous rounds are complete
        for (let i = 0; i < targetRoundIndex; i++) {
          if (!isRoundComplete(i)) {
            return false;
          }
        }
        
        return true;
      },

      // NEW: Check if a specific round is complete
      isRoundComplete: (roundIndex: number): boolean => {
        const { currentInterview, userAnswers } = get();
        
        if (!currentInterview || roundIndex < 0 || roundIndex >= currentInterview.rounds.length) {
          return false;
        }

        const round = currentInterview.rounds[roundIndex];
        
        // Calculate starting index for this round's answers
        let startIndex = 0;
        for (let i = 0; i < roundIndex; i++) {
          startIndex += currentInterview.rounds[i].questions.length;
        }
        
        // Check if all questions in this round have answers
        for (let i = 0; i < round.questions.length; i++) {
          const answerIndex = startIndex + i;
          if (!userAnswers[answerIndex] || userAnswers[answerIndex].trim() === '') {
            return false;
          }
        }
        
        return true;
      },

      // NEW: Get overall progress across all rounds
      getOverallProgress: (): number => {
        const { currentInterview, userAnswers } = get();
        
        if (!currentInterview) return 0;
        
        const totalQuestions = currentInterview.rounds.reduce((total, round) => total + round.questions.length, 0);
        const answeredQuestions = userAnswers.filter(answer => answer && answer.trim() !== '').length;
        
        return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
      },

      // NEW: Get answers for current round only
      getCurrentRoundAnswers: (): string[] => {
        const { currentInterview, currentRoundIndex, userAnswers } = get();
        
        if (!currentInterview) return [];
        
        let startIndex = 0;
        for (let i = 0; i < currentRoundIndex; i++) {
          startIndex += currentInterview.rounds[i].questions.length;
        }
        
        const currentRound = currentInterview.rounds[currentRoundIndex];
        const endIndex = startIndex + currentRound.questions.length;
        
        return userAnswers.slice(startIndex, endIndex);
      },

      getCurrentRound: (): Round | null => {
        const { currentInterview, currentRoundIndex } = get();
        if (currentInterview?.rounds?.[currentRoundIndex]) {
          return currentInterview.rounds[currentRoundIndex];
        }
        return null;
      },

      // FIXED: Submit round answers with proper validation
      submitRoundAnswers: async (sessionId: string, roundIndex: number, answers: string[], authToken?: string): Promise<any> => {
        const { currentInterview } = get();
        if (!currentInterview) {
          throw new Error('No active interview session');
        }

        const currentRound = currentInterview.rounds[roundIndex];
        if (!currentRound) {
          throw new Error('Invalid round index');
        }

        // Validate answers length
        if (answers.length !== currentRound.questions.length) {
          throw new Error(`Expected ${currentRound.questions.length} answers, got ${answers.length}`);
        }

        // Convert answers array to the format expected by the API
        const formattedAnswers = answers.map((answer, questionIndex) => ({
          roundIndex,
          questionIndex,
          answer: answer.trim()
        })).filter(item => item.answer !== ''); // Only submit non-empty answers

        if (formattedAnswers.length === 0) {
          throw new Error('No valid answers to submit');
        }

        return get().submitMultipleAnswers(sessionId, formattedAnswers, authToken);
      },

      // FIXED: Complete interview with proper validation
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
            const errorText = await response.text();
            throw new Error(`Failed to complete interview: ${errorText}`);
          }

          const data = await response.json();
          
          const currentInterview = get().currentInterview;
          if (currentInterview) {
            set({
              currentInterview: { ...currentInterview, isCompleted: true },
              loading: false
            });
          }

          return data.session || get().currentInterview;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // FIXED: Question navigation with proper bounds checking
      setCurrentQuestion: (index: number) => {
        const { currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam && index >= 0 && index < currentExam.totalQuestions) {
          set({ currentQuestionIndex: index });
        } else if (currentInterview) {
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound && index >= 0 && index < currentRound.questions.length) {
            set({ currentQuestionIndex: index });
          } else {
            console.error('Invalid question index:', index);
          }
        }
      },

      updateAnswer: (questionIndex: number, answer: string) => {
        const { userAnswers } = get();
        if (questionIndex < 0 || questionIndex >= userAnswers.length) {
          console.error('Invalid question index for answer update:', questionIndex);
          return;
        }
        
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = answer;
        set({ userAnswers: newAnswers });
      },

      // FIXED: Helper method to update answer for interview with proper validation
      updateInterviewAnswer: (roundIndex: number, questionIndex: number, answer: string) => {
        const { currentInterview, userAnswers } = get();
        if (!currentInterview) {
          console.error('No active interview session');
          return;
        }

        if (roundIndex < 0 || roundIndex >= currentInterview.rounds.length) {
          console.error('Invalid round index:', roundIndex);
          return;
        }

        const round = currentInterview.rounds[roundIndex];
        if (questionIndex < 0 || questionIndex >= round.questions.length) {
          console.error('Invalid question index:', questionIndex);
          return;
        }

        // Calculate the absolute question index across all rounds
        let absoluteIndex = 0;
        for (let i = 0; i < roundIndex; i++) {
          absoluteIndex += currentInterview.rounds[i].questions.length;
        }
        absoluteIndex += questionIndex;

        if (absoluteIndex >= userAnswers.length) {
          console.error('Absolute index out of bounds:', absoluteIndex);
          return;
        }

        const newAnswers = [...userAnswers];
        newAnswers[absoluteIndex] = answer;
        set({ userAnswers: newAnswers });
      },

      // Existing exam methods...
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
            const errorText = await response.text();
            throw new Error(`Failed to submit answers: ${errorText}`);
          }

          const data: SubmitAnswersResponse = await response.json();
          
          const currentExam = get().currentExam;
          if (currentExam) {
            set({
              currentExam: { ...currentExam, isCompleted: true },
              isSubmitting: false
            });
          }

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
            const errorText = await response.text();
            throw new Error(`Failed to complete exam: ${errorText}`);
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
            const errorText = await response.text();
            throw new Error(`Failed to generate summary: ${errorText}`);
          }

          const data: GenerateSummaryResponse = await response.json();
          
          const currentExam = get().currentExam;
          if (currentExam) {
            set({
              currentExam: { ...currentExam, summary: data.session.summary },
              loading: false
            });
          }

          return data.session;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          set({ error: errorMessage, loading: false });
          throw error;
        }
      },

      // FIXED: Video frame with better error handling
      addVideoFrame: async (sessionId: string, frameData: VideoFrameData): Promise<AddVideoFrameResponse | void> => {
        try {
          const response = await fetch(`${API_BASE_URL}/job/interview/${sessionId}/video-frame`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(frameData)
          });

          if (!response.ok) {
            // Don't throw error for video frames, just log
            console.warn('Failed to add video frame:', response.statusText);
            return;
          }

          return await response.json() as AddVideoFrameResponse;
        } catch (error) {
          console.warn('Video frame error:', error);
          // Don't propagate video frame errors to avoid disrupting interview
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
        } else if (timeRemaining === 0) {
          // Auto-submit when timer reaches 0
          console.warn('Timer expired');
          set({ timeRemaining: 0 });
        }
      },

      setTimeRemaining: (time: number) => set({ timeRemaining: Math.max(0, time) }),

      // FIXED: Navigation methods with proper bounds checking
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

      // FIXED: Reset methods with complete cleanup
      resetExam: () => {
        set({
          currentExam: null,
          currentQuestionIndex: 0,
          currentRoundIndex: 0,
          userAnswers: [],
          timeRemaining: null,
          error: null,
          loading: false,
          isSubmitting: false
        });
      },

      resetInterview: () => {
        set({
          currentInterview: null,
          currentRoundIndex: 0,
          currentQuestionIndex: 0,
          userAnswers: [],
          timeRemaining: null,
          error: null,
          loading: false,
          isSubmitting: false
        });
      },

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

      // FIXED: Progress calculation now shows overall progress for interviews
      getProgress: (): number => {
        const { currentQuestionIndex, currentExam, currentInterview } = get();
        
        if (currentExam && currentExam.totalQuestions > 0) {
          return ((currentQuestionIndex + 1) / currentExam.totalQuestions) * 100;
        } else if (currentInterview) {
          // Return overall progress across all rounds
          return get().getOverallProgress();
        }
        return 0;
      },

      getAnsweredCount: (): number => {
        const { userAnswers } = get();
        return userAnswers.filter(answer => answer && answer.trim() !== '').length;
      },

      // FIXED: Check if all questions in current context are answered
      isAllAnswered: (): boolean => {
        const { userAnswers, currentExam, currentInterview, currentRoundIndex } = get();
        
        if (currentExam) {
          return userAnswers.filter(answer => answer && answer.trim() !== '').length === currentExam.totalQuestions;
        } else if (currentInterview) {
          // Check if current round is fully answered
          const currentRound = currentInterview.rounds[currentRoundIndex];
          if (currentRound) {
            const roundStartIndex = currentInterview.rounds
              .slice(0, currentRoundIndex)
              .reduce((acc, round) => acc + round.questions.length, 0);
            const roundAnswers = userAnswers.slice(roundStartIndex, roundStartIndex + currentRound.questions.length);
            return roundAnswers.filter(answer => answer && answer.trim() !== '').length === currentRound.questions.length;
          }
        }
        return false;
      },

      getFormattedTime: (): string => {
        const { timeRemaining } = get();
        if (timeRemaining === null) return '00:00';
        
        const minutes = Math.floor(Math.abs(timeRemaining) / 60);
        const seconds = Math.abs(timeRemaining) % 60;
        const sign = timeRemaining < 0 ? '-' : '';
        return `${sign}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }),
    { name: 'exam-store' }
  )
);

export default useExamStore;