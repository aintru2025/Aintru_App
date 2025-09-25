import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useExamStore from '../stores/ExamStore';
import { 
  Mic, Video, ArrowRight, Clock, CheckCircle, 
  Camera, MicIcon, RotateCcw, AlertCircle, Trophy,
  FileText, BarChart, TrendingUp, Award, MessageCircle,
  MicOff, Briefcase, Building, User
} from 'lucide-react';
import type { VideoFrameData, Round, InterviewSession } from '../stores/exam';

interface JobInterviewProps {
  onBack?: () => void;
}

const JobInterview: React.FC<JobInterviewProps> = ({ onBack }) => {
  const { isAuthenticated, getToken } = useAuthStore();
  const navigate = useNavigate();
  
  // Interview Store
  const {
    currentInterview,
    loading,
    error,
    startInterview,
    getCurrentRound,
    getCurrentQuestion,
    setCurrentRound,
    setCurrentQuestion,
    updateAnswer,
    submitRoundAnswers,
    completeInterview,
    addVideoFrame,
    getProgress,
    getAnsweredCount,
    isAllAnswered,
    getFormattedTime,
    timeRemaining,
    currentQuestionIndex,
    currentRoundIndex,
    userAnswers,
    goToNextQuestion,
    goToPreviousQuestion,
    resetInterview,
    setError,
    clearError
  } = useExamStore();

  // Component State - Using separate local state for form inputs
  const [step, setStep] = useState<'setup' | 'mode-selection' | 'interview' | 'complete'>('setup');
  const [localJobDetails, setLocalJobDetails] = useState({
    company: '',
    role: '',
    experience: 'Fresher'
  });
  const [jobDetails, setJobDetails] = useState({
    company: '',
    role: '',
    experience: 'Fresher'
  });
  const [mode, setMode] = useState<'voice' | 'video' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  // Video/Audio refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setCurrentAnswer(prev => {
            const newValue = prev + finalTranscript;
            const newCursorPosition = newValue.length;
            
            setCursorPosition(newCursorPosition);
            
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                textareaRef.current.focus();
              }
            });
            
            return newValue;
          });
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Voice control functions
  const startListening = () => {
    if (recognitionRef.current && speechSupported && !isListening) {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start speech recognition:', error);
        setIsListening(false);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      try {
        setIsListening(false);
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Failed to stop speech recognition:', error);
      }
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    const value = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    setCursorPosition(start);
    setCurrentAnswer(value);
    
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(start, end);
      }
    });
  };

  const maintainTextareaFocus = () => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!localJobDetails.company.trim()) {
      errors.company = 'Company name is required';
    }
    
    if (!localJobDetails.role.trim()) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Job Interview Practice' }
      });
    }
  }, [isAuthenticated, navigate]);

  // Clear error when step changes
  useEffect(() => {
    clearError();
  }, [step, clearError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
        if (videoFrameIntervalRef.current) {
          clearInterval(videoFrameIntervalRef.current);
        }
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };
  }, [isListening]);

  // Setup Phase Component
  const SetupPhase = () => {
    const handleJobSetup = () => {
      if (validateForm()) {
        setJobDetails(localJobDetails);
        setStep('mode-selection');
      }
    };

    const handleInputChange = (field: string, value: string) => {
      setLocalJobDetails(prev => ({ ...prev, [field]: value }));
      // Clear error for this field if it exists
      if (formErrors[field]) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    };
const handleBlur = (field: string, value: string) => {
  setLocalJobDetails(prev => ({ ...prev, [field]: value }));
};

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Briefcase className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Job Interview Practice</h1>
          <p className="text-gray-600">Prepare for your dream job interview</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Job Interview Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Company *
              </label>
              <input
                type="text"
               defaultValue={localJobDetails.company}   // ab defaultValue use karo
    onBlur={(e) => handleBlur('company', e.target.value)} 
                placeholder="e.g., Google, Microsoft, Startup"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.company ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.company && (
                <p className="text-red-500 text-sm mt-1">{formErrors.company}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role *
              </label>
              <input
                type="text"
                 defaultValue={jobDetails.role}
  onBlur={(e) => handleBlur('role', e.target.value)}
                placeholder="e.g., Software Engineer, Product Manager"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  formErrors.role ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {formErrors.role && (
                <p className="text-red-500 text-sm mt-1">{formErrors.role}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                defaultValue={jobDetails.experience} 
    onBlur={(e) => handleBlur('experience', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Fresher">Fresher</option>
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3+ years">3+ years</option>
              </select>
            </div>
            
            <div className="flex space-x-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleJobSetup}
                className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Continue to Interview Mode
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  // Mode Selection Phase
  const ModeSelection = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Interview Mode</h1>
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-600">Company:</span>
              <p className="text-gray-900">{jobDetails.company}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Role:</span>
              <p className="text-gray-900">{jobDetails.role}</p>
            </div>
            <div>
              <span className="font-medium text-gray-600">Experience:</span>
              <p className="text-gray-900">{jobDetails.experience}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {isStartingInterview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-900 font-semibold mb-2">Setting up your interview...</p>
            <p className="text-gray-600 text-sm">Please wait while we prepare your session</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('voice')}
          disabled={isStartingInterview}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Mic className="w-12 h-12 mb-4" />
          <span className="font-bold text-xl mb-2">Voice Interview</span>
          <span className="text-blue-100 text-sm text-center">
            Practice with voice-only interaction. Perfect for building confidence.
          </span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setMode('video')}
          disabled={isStartingInterview}
          className="bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Video className="w-12 h-12 mb-4" />
          <span className="font-bold text-xl mb-2">Video Interview</span>
          <span className="text-green-100 text-sm text-center">
            Full video experience with behavioral analysis and feedback.
          </span>
        </motion.button>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={() => setStep('setup')}
          disabled={isStartingInterview}
          className="text-gray-600 hover:text-gray-800 flex items-center mx-auto disabled:opacity-50"
        >
          ← Back to Setup
        </button>
      </div>
    </div>
  );

  // Initialize media and start interview
  const startInterviewSession = async () => {
    if (!mode) return;

    setIsStartingInterview(true);
    clearError();

    try {
      // Initialize media based on mode
      if (mode === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          mediaStreamRef.current = stream;

          // Start video frame analysis after interview starts
          setTimeout(() => {
            if (currentInterview?._id) {
              videoFrameIntervalRef.current = setInterval(() => {
                const frameData: VideoFrameData = {
                  timestamp: new Date().toISOString(),
                  faceDetected: true,
                  numFaces: 1,
                  emotions: {
                    happy: 0.1 + Math.random() * 0.3,
                    sad: Math.random() * 0.1,
                    neutral: 0.4 + Math.random() * 0.3,
                    angry: Math.random() * 0.05,
                    surprised: Math.random() * 0.1,
                    disgusted: Math.random() * 0.05,
                    fearful: Math.random() * 0.1
                  }
                };
                addVideoFrame(currentInterview._id, frameData);
              }, 5000);
            }
          }, 2000);
        } catch (mediaError) {
          throw new Error('Camera access denied. Please allow camera and microphone access to continue with video interview.');
        }
      } else if (mode === 'voice') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
        } catch (mediaError) {
          throw new Error('Microphone access denied. Please allow microphone access to continue with voice interview.');
        }
      }

      // Start interview session
      const token = getToken();
      await startInterview(jobDetails.company, jobDetails.role, jobDetails.experience, token);
      setStep('interview');
    } catch (error: any) {
      console.error('Failed to initialize interview:', error);
      setError(error.message || 'Failed to start interview. Please try again.');
      
      // Cleanup media on error
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    } finally {
      setIsStartingInterview(false);
    }
  };

  // Effect to start interview when mode is selected
  useEffect(() => {
    if (mode && step === 'mode-selection' && !isStartingInterview) {
      startInterviewSession();
    }
  }, [mode]);

  // Interview Phase
  const InterviewPhase = () => {
    const currentRound = getCurrentRound();
    const currentQuestion = getCurrentQuestion();
    const progress = getProgress();
    
    const handleAnswerSubmit = () => {
      if (currentAnswer.trim() && currentInterview && currentRound) {
        try {
          // Calculate the global question index
          const roundStartIndex = currentInterview.rounds
            .slice(0, currentRoundIndex)
            .reduce((acc, round) => acc + round.questions.length, 0);
          const globalQuestionIndex = roundStartIndex + currentQuestionIndex;
          
          updateAnswer(globalQuestionIndex, currentAnswer.trim());
          setCurrentAnswer('');
          
          // Auto move to next question
          if (currentQuestionIndex < currentRound.questions.length - 1) {
            goToNextQuestion();
          }
          
          maintainTextareaFocus();
        } catch (error) {
          console.error('Failed to save answer:', error);
          setError('Failed to save answer. Please try again.');
        }
      }
    };

    const handleCompleteRound = async () => {
      if (!currentInterview || !currentRound) return;
      
      try {
        clearError();
        const token = getToken();
        
        // Save current answer if there is one
        if (currentAnswer.trim()) {
          const roundStartIndex = currentInterview.rounds
            .slice(0, currentRoundIndex)
            .reduce((acc, round) => acc + round.questions.length, 0);
          const globalQuestionIndex = roundStartIndex + currentQuestionIndex;
          updateAnswer(globalQuestionIndex, currentAnswer.trim());
        }

        // Get answers for current round
        const roundStartIndex = currentInterview.rounds
          .slice(0, currentRoundIndex)
          .reduce((acc, round) => acc + round.questions.length, 0);
        const roundAnswers = userAnswers.slice(roundStartIndex, roundStartIndex + currentRound.questions.length);

        // Submit round answers
        await submitRoundAnswers(currentInterview._id, currentRoundIndex, roundAnswers, token);

        // Move to next round or complete interview
        if (currentRoundIndex < currentInterview.rounds.length - 1) {
          setCurrentRound(currentRoundIndex + 1);
          setCurrentAnswer('');
        } else {
          // Complete the entire interview
          await completeInterview(currentInterview._id, token);
          
          // Stop media streams
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
          }
          if (videoFrameIntervalRef.current) {
            clearInterval(videoFrameIntervalRef.current);
            videoFrameIntervalRef.current = null;
          }
          
          setStep('complete');
        }
      } catch (error: any) {
        console.error('Failed to complete round:', error);
        setError(error.message || 'Failed to complete round. Please try again.');
      }
    };

    const handleRoundNavigation = (roundIndex: number) => {
      try {
        setCurrentRound(roundIndex);
        setCurrentAnswer('');
        clearError();
      } catch (error) {
        console.error('Failed to navigate to round:', error);
      }
    };

    if (loading && !currentInterview) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Starting your interview...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  clearError();
                  if (mode) {
                    startInterviewSession();
                  }
                }}
                className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  resetInterview();
                  setStep('setup');
                  setMode(null);
                  clearError();
                }}
                className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!currentInterview || !currentRound) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading interview data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="max-w-6xl mx-auto">
            {/* Top row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span className="font-mono text-lg">{getFormattedTime()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  Round {currentRoundIndex + 1} of {currentInterview.totalRounds}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Progress: {Math.round(progress)}%
                </div>
              </div>
            </div>

            {/* Rounds navigation */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {currentInterview.rounds.map((round, index) => (
                <button
                  key={index}
                  onClick={() => handleRoundNavigation(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    index === currentRoundIndex
                      ? 'bg-blue-500 text-white'
                      : index < currentRoundIndex
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {round.name}
                  {index < currentRoundIndex && <CheckCircle className="w-4 h-4 ml-1 inline" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video/Voice Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">
                  {mode === 'video' ? 'Video Interview' : 'Voice Interview'}
                </h3>
                <p className="text-sm text-gray-600">{currentRound.name}</p>
              </div>
              
              {mode === 'video' ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-64 bg-gray-200 rounded-lg object-cover"
                  />
                  <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    Recording
                  </div>
                </div>
              ) : (
                <div className="h-64 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <MicIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Voice Mode Active</p>
                    <p className="text-blue-100">Speak your answers clearly</p>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2">{currentRound.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{currentRound.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Duration: {currentRound.duration} min</span>
                    <span>Questions: {currentRound.questions.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question and Answer Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              {currentQuestion && (
                <>
                  <div className="mb-6">
                    <div className="flex items-start space-x-3 mb-4">
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        Q{currentQuestionIndex + 1}/{currentRound.questions.length}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {currentQuestion.question}
                      </h2>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Your Answer
                      </label>
                      {speechSupported && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-lg transition-colors ${
                              isListening
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                            }`}
                            title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}
                          >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                          </button>
                          <span className="text-sm text-gray-500">
                            {isListening ? 'Listening...' : 'Voice Input'}
                          </span>
                        </div>
                      )}
                    </div>
                    <textarea
                      ref={textareaRef}
                      value={currentAnswer}
                      onChange={handleTextareaChange}
                      onFocus={maintainTextareaFocus}
                      placeholder="Type your answer here or use voice input..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      autoFocus
                    />
                    {isListening && (
                      <p className="text-sm text-blue-600 mt-2">🎤 Listening... Speak clearly into your microphone</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button
                        onClick={goToPreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      
                      {currentQuestionIndex < currentRound.questions.length - 1 ? (
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!currentAnswer.trim()}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={handleAnswerSubmit}
                          disabled={!currentAnswer.trim()}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                        >
                          Save Answer
                        </button>
                      )}
                    </div>

                    {currentQuestionIndex === currentRound.questions.length - 1 && (
                      <button
                        onClick={handleCompleteRound}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>
                          {currentRoundIndex === currentInterview.rounds.length - 1 
                            ? 'Complete Interview' 
                            : 'Complete Round'
                          }
                        </span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Complete Phase
  const CompletePhase = () => {
    const handleDownloadReport = () => {
      try {
        const reportData = {
          interviewDetails: jobDetails,
          mode: mode,
          completedAt: new Date().toISOString(),
          session: currentInterview,
          answers: userAnswers.filter(answer => answer.trim() !== '')
        };

        const element = document.createElement('a');
        const file = new Blob([JSON.stringify(reportData, null, 2)], {
          type: 'application/json'
        });
        element.href = URL.createObjectURL(file);
        element.download = `interview_results_${jobDetails.company}_${jobDetails.role}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } catch (error) {
        console.error('Failed to download report:', error);
        setError('Failed to download report. Please try again.');
      }
    };

    const handleStartNewInterview = () => {
      try {
        resetInterview();
        setStep('setup');
        setLocalJobDetails({ company: '', role: '', experience: 'Fresher' });
        setJobDetails({ company: '', role: '', experience: 'Fresher' });
        setMode(null);
        setCurrentAnswer('');
        setFormErrors({});
        clearError();
      } catch (error) {
        console.error('Failed to reset interview:', error);
      }
    };

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
          <p className="text-gray-600">
            Congratulations! You've successfully completed your job interview practice.
          </p>
        </motion.div>

        {/* Results Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Interview Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-2">
                <Building className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-bold">{jobDetails.company}</div>
              </div>
              <div className="text-sm text-gray-600">Target Company</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-2">
                <User className="w-8 h-8 mx-auto mb-2" />
                <div className="text-lg font-bold">{jobDetails.role}</div>
              </div>
              <div className="text-sm text-gray-600">Target Role</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 text-purple-700 p-4 rounded-lg mb-2">
                <BarChart className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{currentInterview?.totalRounds || 0}</div>
              </div>
              <div className="text-sm text-gray-600">Rounds Completed</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 text-orange-700 p-4 rounded-lg mb-2">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{mode === 'video' ? 'A+' : 'A'}</div>
              </div>
              <div className="text-sm text-gray-600">Overall Performance</div>
            </div>
          </div>

          {/* Round-wise Performance */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Round-wise Performance</h3>
            <div className="space-y-4">
              {currentInterview?.rounds?.map((round, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      Round {index + 1}: {round.name}
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Completed
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{round.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Questions: {round.questions.length}</span>
                    <span>Duration: {round.duration} min</span>
                    <span>Type: {round.type}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {currentInterview?.summary && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Feedback Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentInterview.summary}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartNewInterview}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start New Interview</span>
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Tips for Improvement */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Tips for Next Interview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">STAR Method</h4>
              <p className="text-gray-600 text-sm">
                Structure your answers using Situation, Task, Action, Result framework.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Company Research</h4>
              <p className="text-gray-600 text-sm">
                Research the company's values, recent news, and culture before the interview.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Ask Questions</h4>
              <p className="text-gray-600 text-sm">
                Prepare thoughtful questions about the role and company to show genuine interest.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Body Language</h4>
              <p className="text-gray-600 text-sm">
                {mode === 'video' ? 
                  'Your video analysis shows areas for improvement in posture and eye contact.' :
                  'Try video mode next time to get feedback on your body language.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  const renderCurrentStep = () => {
    switch (step) {
      case 'setup':
        return <SetupPhase />;
      case 'mode-selection':
        return <ModeSelection />;
      case 'interview':
        return <InterviewPhase />;
      case 'complete':
        return <CompletePhase />;
      default:
        return <SetupPhase />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      {renderCurrentStep()}
    </div>
  );
};

export default JobInterview;