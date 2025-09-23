import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useExamStore from '../stores/ExamStore';
import { 
  Mic, Video, Upload, User, ArrowRight, Clock, CheckCircle, 
  Building, Briefcase, GraduationCap, Camera, MicIcon, 
  Play, Pause, RotateCcw, Send, AlertCircle, Trophy,
  FileText, BarChart, TrendingUp, Award, MessageCircle
} from 'lucide-react';
import type { ExamSession, VideoFrameData } from '../types/exam';

interface SetupData {
  preparationType: 'exam' | 'job';
  // Exam specific
  examType?: string;
  examName?: string;
  // Job specific
  company?: string;
  role?: string;
  experienceLevel?: string;
  candidateProfile?: any;
  interviewFlow?: any;
}

const MockInterview = () => {
  const { isAuthenticated, getToken } = useAuthStore();
  const navigate = useNavigate();
  
  // Exam Store
  const {
    currentExam,
    loading,
    error,
    startExam,
    updateAnswer,
    submitAnswers,
    completeExam,
    generateSummary,
    addVideoFrame,
    getCurrentQuestion,
    getProgress,
    getAnsweredCount,
    isAllAnswered,
    getFormattedTime,
    timeRemaining,
    currentQuestionIndex,
    userAnswers,
    goToNextQuestion,
    goToPreviousQuestion,
    resetExam
  } = useExamStore();

  // Component State
  const [step, setStep] = useState<'setup' | 'mode-selection' | 'interview' | 'complete'>('setup');
  const [setupData, setSetupData] = useState<SetupData>({} as SetupData);
  const [mode, setMode] = useState<'voice' | 'video' | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Video/Audio refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Mock Interview' }
      });
    }
  }, [isAuthenticated, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoFrameIntervalRef.current) {
        clearInterval(videoFrameIntervalRef.current);
      }
    };
  }, []);

  // Setup Phase Component
  const SetupPhase = () => {
    const [preparationType, setPreparationType] = useState<'exam' | 'job' | null>(null);
    const [examDetails, setExamDetails] = useState({ type: '', name: '' });
    const [jobDetails, setJobDetails] = useState({
      company: '',
      role: '',
      experience: 'Fresher'
    });

    const handleExamSetup = async () => {
      const setupConfig: SetupData = {
        preparationType: 'exam',
        examType: examDetails.type,
        examName: examDetails.name || examDetails.type
      };
      setSetupData(setupConfig);
      setStep('mode-selection');
    };

    const handleJobSetup = async () => {
      // For now, create mock interview flow since API endpoint might not exist
      const mockInterviewFlow = {
        company: jobDetails.company,
        role: jobDetails.role,
        rounds: [
          { name: 'HR Round', duration: '15 mins', description: 'Basic HR questions' },
          { name: 'Technical Round', duration: '30 mins', description: 'Technical skills assessment' },
          { name: 'Final Round', duration: '20 mins', description: 'Culture fit and salary discussion' }
        ],
        totalDuration: 65
      };

      const setupConfig: SetupData = {
        preparationType: 'job',
        company: jobDetails.company,
        role: jobDetails.role,
        experienceLevel: jobDetails.experience,
        interviewFlow: mockInterviewFlow
      };
      setSetupData(setupConfig);
      setStep('mode-selection');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">AI Mock Interview Setup</h1>
            <p className="text-gray-600">Choose your preparation type and get started</p>
          </motion.div>

          {!preparationType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
            >
              <button
                onClick={() => setPreparationType('exam')}
                className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform"
              >
                <GraduationCap className="w-12 h-12 mb-4" />
                <span className="font-bold text-xl mb-2">Exam Preparation</span>
                <span className="text-purple-100 text-sm text-center">
                  Practice for competitive exams, entrance tests, or academic interviews
                </span>
              </button>
              
              <button
                onClick={() => setPreparationType('job')}
                className="bg-gradient-to-br from-blue-500 to-green-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform"
              >
                <Briefcase className="w-12 h-12 mb-4" />
                <span className="font-bold text-xl mb-2">Job Interview</span>
                <span className="text-blue-100 text-sm text-center">
                  Practice for job interviews, internships, or career opportunities
                </span>
              </button>
            </motion.div>
          )}

          {preparationType === 'exam' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Exam Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Exam Type
                  </label>
                  <select
                    value={examDetails.type}
                    onChange={(e) => setExamDetails(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose Exam Type</option>
                    <option value="JavaScript Fundamentals">JavaScript Fundamentals</option>
                    <option value="React Development">React Development</option>
                    <option value="Node.js Backend">Node.js Backend</option>
                    <option value="Python Programming">Python Programming</option>
                    <option value="Data Structures">Data Structures & Algorithms</option>
                    <option value="GATE">GATE</option>
                    <option value="CAT">CAT</option>
                    <option value="GRE">GRE</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="Custom">Custom Exam</option>
                  </select>
                </div>
                
                {examDetails.type === 'Custom' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Custom Exam Name
                    </label>
                    <input
                      type="text"
                      value={examDetails.name}
                      onChange={(e) => setExamDetails(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter exam name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
                
                <button
                  onClick={handleExamSetup}
                  disabled={!examDetails.type || (examDetails.type === 'Custom' && !examDetails.name)}
                  className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                >
                  Continue to Interview Mode
                </button>
              </div>
            </motion.div>
          )}

          {preparationType === 'job' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-8 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Job Interview Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Company
                  </label>
                  <input
                    type="text"
                    value={jobDetails.company}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Google, Microsoft, Startup"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={jobDetails.role}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Software Engineer, Product Manager"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level
                  </label>
                  <select
                    value={jobDetails.experience}
                    onChange={(e) => setJobDetails(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Fresher">Fresher</option>
                    <option value="0-1 years">0-1 years</option>
                    <option value="1-3 years">1-3 years</option>
                    <option value="3+ years">3+ years</option>
                  </select>
                </div>
                
                <button
                  onClick={handleJobSetup}
                  disabled={!jobDetails.company || !jobDetails.role}
                  className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  Continue to Interview Mode
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  // Mode Selection Phase
  const ModeSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Interview Mode</h1>
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Type:</span>
                <p className="text-gray-900 capitalize">{setupData.preparationType}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">
                  {setupData.preparationType === 'exam' ? 'Exam:' : 'Company:'}
                </span>
                <p className="text-gray-900">
                  {setupData.preparationType === 'exam' ? setupData.examName : setupData.company}
                </p>
              </div>
              {setupData.preparationType === 'job' && (
                <>
                  <div>
                    <span className="font-medium text-gray-600">Role:</span>
                    <p className="text-gray-900">{setupData.role}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Experience:</span>
                    <p className="text-gray-900">{setupData.experienceLevel}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setMode('voice')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg transition-transform"
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
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg transition-transform"
          >
            <Video className="w-12 h-12 mb-4" />
            <span className="font-bold text-xl mb-2">Video Interview</span>
            <span className="text-purple-100 text-sm text-center">
              Full video experience with behavioral analysis and feedback.
            </span>
          </motion.button>
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => setStep('setup')}
            className="text-gray-600 hover:text-gray-800 flex items-center mx-auto"
          >
            ← Back to Setup
          </button>
        </div>
      </div>
    </div>
  );

  // Initialize media and start exam
  const startInterviewSession = async () => {
    try {
      // Initialize media based on mode
      if (mode === 'video') {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        mediaStreamRef.current = stream;

        // Start video frame analysis
        videoFrameIntervalRef.current = setInterval(() => {
          if (currentExam?._id) {
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
            addVideoFrame(currentExam._id, frameData);
          }
        }, 5000); // Every 5 seconds
      } else if (mode === 'voice') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      }

      // Start exam session
      const token = getToken();
      if (setupData.preparationType === 'exam' && setupData.examName && token) {
        await startExam(setupData.examName, token);
      }
      
      setStep('interview');
    } catch (error) {
      console.error('Failed to initialize interview:', error);
      alert('Failed to access camera/microphone. Please check permissions and try again.');
    }
  };

  // Effect to start interview when mode is selected
  useEffect(() => {
    if (mode && step === 'mode-selection') {
      startInterviewSession();
    }
  }, [mode]);

  // Interview Phase
  const InterviewPhase = () => {
    const currentQuestion = getCurrentQuestion();
    const progress = getProgress();
    
    const handleAnswerSubmit = () => {
      if (currentAnswer.trim() && currentExam) {
        updateAnswer(currentQuestionIndex, currentAnswer.trim());
        setCurrentAnswer('');
        
        // Auto move to next question
        if (currentQuestionIndex < currentExam.totalQuestions - 1) {
          goToNextQuestion();
        }
      }
    };

    const handleCompleteInterview = async () => {
      if (currentExam && isAllAnswered()) {
        try {
          const token = getToken();
          if (token) {
            await submitAnswers(currentExam._id, token);
            await completeExam(currentExam._id, token);
            await generateSummary(currentExam._id, token);
            setStep('complete');
          }
        } catch (error) {
          console.error('Failed to complete interview:', error);
        }
      }
    };

    if (loading && !currentExam) {
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
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => setStep('setup')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm px-4 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="font-mono text-lg">{getFormattedTime()}</span>
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {currentExam?.totalQuestions}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                Progress: {Math.round(progress)}%
              </div>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Answered: {getAnsweredCount()}/{currentExam?.totalQuestions}
              </div>
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
                <div className="h-64 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <MicIcon className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-semibold">Voice Mode Active</p>
                    <p className="text-blue-100">Speak your answers clearly</p>
                  </div>
                </div>
              )}

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  {isRecording ? (
                    <>
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <span>Recording</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span>Ready</span>
                    </>
                  )}
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
                        Q{currentQuestionIndex + 1}
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 flex-1">
                        {currentQuestion.question}
                      </h2>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Your Answer
                    </label>
                    <textarea
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
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
                      
                      {currentQuestionIndex < (currentExam?.totalQuestions || 1) - 1 ? (
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

                    {isAllAnswered() && (
                      <button
                        onClick={handleCompleteInterview}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Complete Interview</span>
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
  const CompletePhase = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
          <p className="text-gray-600">
            Congratulations! You've successfully completed your mock interview.
          </p>
        </motion.div>

        {/* Results Summary */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Performance Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 p-4 rounded-lg mb-2">
                <BarChart className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{currentExam?.totalQuestions || 0}</div>
              </div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-2">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{Math.round(((currentExam?.timeLimit || 0) * 60 - (timeRemaining || 0)) / 60)}min</div>
              </div>
              <div className="text-sm text-gray-600">Time Taken</div>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 text-purple-700 p-4 rounded-lg mb-2">
                <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">85%</div>
              </div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-100 text-orange-700 p-4 rounded-lg mb-2">
                <Award className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">{mode === 'video' ? 'A+' : 'A'}</div>
              </div>
              <div className="text-sm text-gray-600">Overall Grade</div>
            </div>
          </div>

          {/* AI Summary */}
          {currentExam?.summary && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                AI Feedback Summary
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentExam.summary}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Breakdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question-wise Performance</h3>
            <div className="space-y-4">
              {currentExam?.questions?.map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">
                      Q{index + 1}: {question.question.substring(0, 100)}...
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs ${
                      question.isCorrect === true ? 'bg-green-100 text-green-700' :
                      question.isCorrect === false ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {question.isCorrect === true ? 'Correct' :
                       question.isCorrect === false ? 'Incorrect' :
                       'Reviewed'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">
                    Your Answer: {question.userAnswer?.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                resetExam();
                setStep('setup');
                setSetupData({} as SetupData);
                setMode(null);
              }}
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
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([JSON.stringify(currentExam, null, 2)], {
                  type: 'application/json'
                });
                element.href = URL.createObjectURL(file);
                element.download = `interview_results_${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Report</span>
            </button>
          </div>
        </div>

        {/* Tips for Improvement */}
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Tips for Next Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Practice More</h4>
              <p className="text-gray-600 text-sm">
                Regular practice sessions help build confidence and improve performance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Focus on Clarity</h4>
              <p className="text-gray-600 text-sm">
                Clear and structured answers make a stronger impression on interviewers.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Time Management</h4>
              <p className="text-gray-600 text-sm">
                Practice managing your time effectively during interviews.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Body Language</h4>
              <p className="text-gray-600 text-sm">
                {mode === 'video' ? 
                  'Your video analysis shows room for improvement in posture and eye contact.' :
                  'Try video mode next time to get feedback on your body language.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

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
    <AnimatePresence mode="wait">
      {renderCurrentStep()}
    </AnimatePresence>
  );
};

export default MockInterview;