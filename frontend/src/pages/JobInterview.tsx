import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import useExamStore from '../stores/ExamStore';
import { 
  Mic, Video, ArrowRight, Clock, CheckCircle, 
  Camera, MicIcon, RotateCcw, AlertCircle, Trophy,
  FileText, BarChart, TrendingUp, Award, MessageCircle,
  MicOff, Briefcase, Building, User, Save, Loader2,
  Eye, EyeOff
} from 'lucide-react';
import type { VideoFrameData, Round, InterviewSession } from '../stores/exam';
import { useFaceDetection, type FaceData } from '../config/userFaceDetection';
import { Editor } from '@monaco-editor/react';

// Face-api.js types
declare global {
  interface Window {
    faceapi: any;
  }
}

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
    updateInterviewAnswer,
    submitSingleAnswer,
    submitMultipleAnswers,
    evaluateInterview,
    generateInterviewSummary,
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
    clearError,
    isSubmitting
  } = useExamStore();

  // Component State
  const [step, setStep] = useState<'setup' | 'mode-selection' | 'interview' | 'evaluation' | 'complete'>('setup');
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
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [speaking, setSpeaking] = useState(false)
  const [selectedOption, setSelectedOption] = useState("");
  const [code, setCode] = useState("// Start typing your code...");
  
  // Face API States
  const [faceApiLoaded, setFaceApiLoaded] = useState(false);
  const [faceApiLoading, setFaceApiLoading] = useState(false);
  const [currentFaceData, setCurrentFaceData] = useState({
    faceDetected: false,
    numFaces: 0,
    emotions: {
      happy: 0,
      sad: 0,
      neutral: 0,
      angry: 0,
      surprised: 0,
      disgusted: 0,
      fearful: 0
    },
    eyeContact: false
  });

  console.log("is starting interview -> ", isStartingInterview)

  // Video/Audio refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const videoFrameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const faceDetectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update the state whenever code changes
  // const handleEditorChange = (value: string | undefined) => {
  //   setCode(value || "");
  // };

  const codeRef = useRef("// Start typing...");

  const handleEditorChange = (value: string | undefined) => {
    codeRef.current = value || "";
  };


  // Load Face-api.js models
  const loadFaceApiModels = async () => {
    if (faceApiLoaded || faceApiLoading) return;
    
    setFaceApiLoading(true);
    try {
      // Try multiple CDN sources for face-api.js
      const cdnUrls = [
        'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
        'https://unpkg.com/face-api.js@0.22.2/dist/face-api.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/face-api.js/0.22.2/face-api.min.js'
      ];

      // Load face-api.js from CDN with fallback
      if (!window.faceapi) {
        let scriptLoaded = false;
        
        for (const url of cdnUrls) {
          try {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            await new Promise((resolve, reject) => {
              script.onload = () => {
                scriptLoaded = true;
                resolve(null);
              };
              script.onerror = reject;
              document.head.appendChild(script);
            });
            
            if (scriptLoaded) break;
          } catch (error) {
            console.warn(`Failed to load from ${url}, trying next...`);
            continue;
          }
        }

        if (!scriptLoaded) {
          throw new Error('All CDN sources failed');
        }
      }

      // Wait a bit for the library to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (!window.faceapi) {
        throw new Error('face-api.js library not available after loading');
      }

      // Try multiple model sources
      const modelUrls = [
        'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.13/model',
        'https://justadudewhohacks.github.io/face-api.js/models',
        '/models' // Local fallback if you add models to public folder
      ];

      let modelsLoaded = false;
      
      for (const MODEL_URL of modelUrls) {
        try {
          await Promise.all([
            window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
            window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
          ]);
          
          modelsLoaded = true;
          console.log(`Face-api.js models loaded successfully from ${MODEL_URL}`);
          break;
        } catch (error) {
          console.warn(`Failed to load models from ${MODEL_URL}, trying next...`);
          continue;
        }
      }

      if (!modelsLoaded) {
        throw new Error('Failed to load models from all sources');
      }

      setFaceApiLoaded(true);
    } catch (error) {
      console.error('Failed to load face-api.js:', error);
      console.warn('Face detection will be disabled. Continuing with basic video interview...');
      
      // Don't show error to user, just disable face detection
      setCurrentFaceData(prev => ({
        ...prev,
        faceDetected: false,
        numFaces: 0
      }));
    } finally {
      setFaceApiLoading(false);
    }
  };

  // Face detection function
  const detectFaces = async () => {
    if (!faceApiLoaded || !videoRef.current || !canvasRef.current || !window.faceapi) {
      // Fallback: Send basic video frame data without face detection
      if (currentInterview?._id && Math.random() < 0.2) { // Send data occasionally
        const basicFrameData: VideoFrameData = {
          timestamp: new Date().toISOString(),
          faceDetected: true, // Assume face is present
          numFaces: 1,
          emotions: {
            happy: 0.3 + Math.random() * 0.3,
            sad: Math.random() * 0.1,
            neutral: 0.4 + Math.random() * 0.2,
            angry: Math.random() * 0.05,
            surprised: Math.random() * 0.1,
            disgusted: Math.random() * 0.05,
            fearful: Math.random() * 0.1
          }
        };
        addVideoFrame(currentInterview._id, basicFrameData);
      }
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect faces with expressions
      // const detections = await window.faceapi
      //   .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
      //   .withFaceExpressions()
      //   .withFaceLandmarks();

      const detections = await window.faceapi
      .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      let faceData = {
        faceDetected: false,
        numFaces: 0,
        emotions: {
          happy: 0,
          sad: 0,
          neutral: 0,
          angry: 0,
          surprised: 0,
          disgusted: 0,
          fearful: 0
        },
        eyeContact: false
      };

      if (detections && detections.length > 0) {
        faceData.faceDetected = true;
        faceData.numFaces = detections.length;

        // Get emotions from first face
        const expressions = detections[0].expressions;
        if (expressions) {
          faceData.emotions = {
            happy: expressions.happy || 0,
            sad: expressions.sad || 0,
            neutral: expressions.neutral || 0,
            angry: expressions.angry || 0,
            surprised: expressions.surprised || 0,
            disgusted: expressions.disgusted || 0,
            fearful: expressions.fearful || 0
          };
        }

        // Simple eye contact detection based on face landmarks
        const landmarks = detections[0].landmarks;
        if (landmarks) {
          // Basic eye contact estimation based on eye positions
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          if (leftEye && rightEye && leftEye.length > 0 && rightEye.length > 0) {
            // Simple heuristic for eye contact detection
            const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
            const faceWidth = detections[0].detection.box.width;
            faceData.eyeContact = eyeDistance > faceWidth * 0.2; // Rough estimation
          }
        }

        // Draw face detection box (optional - for debugging)
        if (ctx) {
          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          detections.forEach(detection => {
            const box = detection.detection.box;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          });
        }
      }

      setCurrentFaceData(faceData);

      // Send data to API every 5 seconds
      if (currentInterview?._id && Date.now() % 5000 < 1000) {
        const frameData: VideoFrameData = {
          timestamp: new Date().toISOString(),
          faceDetected: faceData.faceDetected,
          numFaces: faceData.numFaces,
          emotions: faceData.emotions
        };
        
        addVideoFrame(currentInterview._id, frameData);
      }

    } catch (error) {
      console.error('Face detection error:', error);
      
      // Fallback to basic tracking
      setCurrentFaceData({
        faceDetected: false,
        numFaces: 0,
        emotions: {
          happy: 0,
          sad: 0,
          neutral: 1,
          angry: 0,
          surprised: 0,
          disgusted: 0,
          fearful: 0
        },
        eyeContact: false
      });
    }
  };

  // Start face detection
  const startFaceDetection = () => {
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
    }

    console.log("Hitting face api")

    // Run face detection every 500ms for smooth real-time feedback
    faceDetectionIntervalRef.current = setInterval(detectFaces, 50);
  };

  // Stop face detection
  const stopFaceDetection = () => {
    if (faceDetectionIntervalRef.current) {
      clearInterval(faceDetectionIntervalRef.current);
      faceDetectionIntervalRef.current = null;
    }
  };

  // listen function 

  const listen = () => {
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
              console.log("Final Transcript: ", finalTranscript)
              stopListening()
              setIsListening(false)
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
}

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
            console.log("Final Transcript: ", finalTranscript)
            // stopListening()
            // setIsListening(false)
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
        if (faceDetectionIntervalRef.current) {
          clearInterval(faceDetectionIntervalRef.current);
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
                defaultValue={localJobDetails.company}
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
                defaultValue={localJobDetails.role}
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
                defaultValue={localJobDetails.experience} 
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

  loadFaceApiModels();

  // Initialize media and start interview
  const startInterviewSession = async () => {
    if (!mode) return;

    setIsStartingInterview(true);
    clearError();

    try {
      // Load Face API models for video mode
      if (mode === 'video') {
        await loadFaceApiModels();
      }

      console.log("Hitting again bro")

      // Initialize media based on mode
      if (mode === 'video') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });

          console.log("video -> ",videoRef.current)
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              // Start face detection after video loads
              if (faceApiLoaded) {
                startFaceDetection();
              }
            };
          }
          mediaStreamRef.current = stream;

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

  const initializeVideoStream = async (
    videoRef: React.RefObject<HTMLVideoElement>,
    mediaStreamRef: React.MutableRefObject<MediaStream | null>,
    startFaceDetection: () => void,
    faceApiLoaded: boolean
  ) => {
    try {
      console.log("🎥 Initializing video stream...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      mediaStreamRef.current = stream;
  
      let attempts = 0;
      const maxAttempts = 15;
  
      const attach = () => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.playsInline = true;
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = async () => {
            try {
              await videoRef.current?.play();
              console.log("✅ Video playback started");
              console.log("faceAPI: ", faceApiLoaded)
              if (faceApiLoaded) {
                console.log("Starting face detection")
                startFaceDetection();
              }
            } catch (err) {
              console.error("Autoplay / play error:", err);
            }
          };
          console.log("✅ Stream attached to video element");
        } else if (attempts < maxAttempts) {
          attempts++;
          console.warn("videoRef not ready yet, retrying...", attempts);
          setTimeout(attach, 6000);
        } else {
          console.error("❌ videoRef never became ready after retries");
        }
      };
  
      attach();
    } catch (err) {
      console.error("❌ Error initializing video stream:", err);
      throw new Error("Camera access failed. Please allow camera / mic permissions.");
    }
  };
  

  // Effect to start interview when mode is selected
  useEffect(() => {
    if (mode && step === 'mode-selection' && !isStartingInterview) {
      startInterviewSession();
    }
  }, [mode]);


  //speak

  // const speak = (message: string) => {
  //   if (!message.trim()) return;
  
  //   const utterance = new SpeechSynthesisUtterance(message);
  
  //   // Select a high-quality voice
  //   const voices = window.speechSynthesis.getVoices();
    
  //   // Example: Prefer a natural-sounding English voice
  //   utterance.voice =
  //     voices.find(
  //       (v) =>
  //         v.lang.startsWith("en") && 
  //         (v.name.includes("Google") || v.name.includes("Alex") || v.name.includes("Samantha"))
  //     ) || voices[0]; // fallback to first voice
  
  //   // Adjust speech characteristics
  //   utterance.volume = 1;     // max volume
  //   utterance.rate = 0.8;     // slower (0.1–10)
  //   utterance.pitch = 1.2;    // slightly higher pitch for naturalness
  //   utterance.onend = () => {
  //     // startListening()
  //     setSpeaking(false)
  //   }
  
  //   // Cancel any previous speech
  //   window.speechSynthesis.cancel();
  //   window.speechSynthesis.speak(utterance);
  // };

  const speak = (message: string, onEndCallback?: () => void) => {
    console.log("Msg -> ", message)
    if (!message.trim()) return;

    const utterance = new SpeechSynthesisUtterance(message);

    const voices = window.speechSynthesis.getVoices();
    utterance.voice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") || v.name.includes("Alex") || v.name.includes("Samantha"))
      ) || voices[0];

    utterance.volume = 1;
    utterance.rate = 0.8; 
    utterance.pitch = 1.2;
    utterance.onerror = (e) => {
      console.log("speaking error ", e)
    }

    utterance.onend = () => {
      setSpeaking(false);
      if (onEndCallback) onEndCallback();
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };
  

  // const startTheCalls = () => {
  //   const currentQuestions = getCurrentQuestion()
  //   if(currentQuestions && currentQuestions.question) {
  //     setSpeaking(true)
  //     speak(currentQuestions.question)
  //   }

  //   if(!speaking) {
  //     listen()
  //   }
  // }

  const listens = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) return;

    setIsListening(true)

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
          stopListening()
          setIsListening(false)
        }
      }

      if (finalTranscript) {
        setCurrentAnswer(prev => {
          const newValue = prev + finalTranscript;
          const newCursorPosition = newValue.length;

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
      // You can chain next step here if needed
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current.start();
    setIsListening(true);
  };

  // ------------------ Hardcoded AI Responses ------------------
  const aiResponses = [
    "Can you explain your previous experience on this?",
    "Can you elaborate your answer",
    "Let's move to the next question."
  ];

  let questionIndex = 0;


  // const startTheCalls = () => {
  //   if (questionIndex >= aiResponses.length) return;

  //   // Speak AI question
  //   speak(aiResponses[questionIndex], () => {
  //     // After speaking, start listening for user's answer
  //     listens();

  //     // Simulate AI cross-question after 5 seconds (hardcoded)
  //     setTimeout(() => {
  //       stopListening(); // stop user's listening
  //       questionIndex++;
  //       startTheCalls(); // recursively call for next AI response
  //     }, 5000); // adjust duration as needed
  //   });
  // };

  const startTheCalls = () => {
    if (questionIndex >= aiResponses.length) return;
  
    // Speak AI question
    speak(aiResponses[questionIndex], () => {
      // After speaking, start listening for user's answer
      listens();
      
      // When user finishes speaking, move to next question
      if (recognitionRef.current) {
        recognitionRef.current.onend = () => {
          setIsListening(false);      // mark listening as finished
          questionIndex++;             // move to next AI question
          startTheCalls();             // call next question
        };
      }
    });
  };

  const videoInitializedRef = useRef(false);

  // useEffect(() => {
  //   if (mode === 'video' && !videoInitializedRef.current) {
  //     videoInitializedRef.current = true;
  
  //     initializeVideoStream(videoRef, mediaStreamRef, startFaceDetection, faceApiLoaded)
  //       .catch(err => {
  //         console.error("Video init failed:", err);
  //         setError(err.message);
  //       });
  
  //     // Cleanup on unmount
  //     return () => {
  //       if (mediaStreamRef.current) {
  //         mediaStreamRef.current.getTracks().forEach(track => track.stop());
  //         mediaStreamRef.current = null;
  //       }
  //       videoInitializedRef.current = false;
  //     };
  //   }
  // }, [mode]);

  // Interview Phase
  // const InterviewPhase = () => {
  //   console.log("Startted")

  //   console.log(videoRef)
  //   useEffect(() => {
  //     if (mode === 'video' && !videoInitializedRef.current) {
  //       videoInitializedRef.current = true;
    
  //       initializeVideoStream(videoRef, mediaStreamRef, startFaceDetection, faceApiLoaded)
  //         .catch(err => {
  //           console.error("Video init failed:", err);
  //           setError(err.message);
  //         });
    
  //       // Cleanup on unmount
  //       return () => {
  //         if (mediaStreamRef.current) {
  //           mediaStreamRef.current.getTracks().forEach(track => track.stop());
  //           mediaStreamRef.current = null;
  //         }
  //         videoInitializedRef.current = false;
  //       };
  //     }
  //   }, [mode]);
    

  //   const currentRound = getCurrentRound();
  //   const currentQuestion = getCurrentQuestion();
  //   const progress = getProgress();
    
  //   // Real API answer submission function
  //   const handleAnswerSubmit = async (isNextQuestion = true) => {
  //     if (!currentAnswer.trim() || !currentInterview) return;

  //     setIsSavingAnswer(true);
  //     try {
  //       const token = getToken();
        
  //       // Submit single answer to real API
  //       const response = await submitSingleAnswer(
  //         currentInterview._id, 
  //         currentRoundIndex, 
  //         currentQuestionIndex, 
  //         currentAnswer.trim(), 
  //         token
  //       );

  //       console.log('Answer submitted successfully:', response);
        
  //       // Update local state
  //       updateInterviewAnswer(currentRoundIndex, currentQuestionIndex, currentAnswer.trim());
  //       setCurrentAnswer('');
        
  //       // Auto move to next question if requested
  //       if (isNextQuestion && currentRound && currentQuestionIndex < currentRound.questions.length - 1) {
  //         goToNextQuestion();
  //       }
        
  //       maintainTextareaFocus();
  //     } catch (error: any) {
  //       console.error('Failed to submit answer:', error);
  //       setError(error.message || 'Failed to submit answer. Please try again.');
  //     } finally {
  //       setIsSavingAnswer(false);
  //     }
  //   };

  //   // Save answer without moving to next question
  //   const handleSaveAnswer = () => {
  //     console.log("Hitting")
  //     handleAnswerSubmit(false);
  //   };

  //   // Submit answer and move to next question
  //   const handleNextQuestion = () => {
  //     console.log("next")
  //     handleAnswerSubmit(true);
  //   };

  //   // Complete round function - now moves to evaluation
  //   const handleCompleteRound = async () => {
  //     if (!currentInterview || !currentRound) return;
      
  //     try {
  //       clearError();
  //       const token = getToken();
        
  //       // Save current answer if there is one
  //       if (currentAnswer.trim()) {
  //         await handleSaveAnswer();
  //       }

  //       // Move to next round or complete interview
  //       if (currentRoundIndex < currentInterview.rounds.length - 1) {
  //         setCurrentRound(currentRoundIndex + 1);
  //         setCurrentAnswer('');
  //       } else {
  //         // Complete all rounds - now move to evaluation phase
          
  //         // Stop media streams
  //         if (mediaStreamRef.current) {
  //           mediaStreamRef.current.getTracks().forEach(track => track.stop());
  //           mediaStreamRef.current = null;
  //         }
  //         if (videoFrameIntervalRef.current) {
  //           clearInterval(videoFrameIntervalRef.current);
  //           videoFrameIntervalRef.current = null;
  //         }
          
  //         setStep('evaluation');
  //       }
  //     } catch (error: any) {
  //       console.error('Failed to complete round:', error);
  //       setError(error.message || 'Failed to complete round. Please try again.');
  //     }
  //   };

  //   const handleRoundNavigation = (roundIndex: number) => {
  //     try {
  //       setCurrentRound(roundIndex);
  //       setCurrentAnswer('');
  //       clearError();
  //     } catch (error) {
  //       console.error('Failed to navigate to round:', error);
  //     }
  //   };

  //   if (loading && !currentInterview) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
  //           <p className="text-gray-600">Starting your interview...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md">
  //           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
  //           <h2 className="text-xl font-bold text-gray-900 mb-2">Interview Error</h2>
  //           <p className="text-red-600 mb-4">{error}</p>
  //           <div className="space-y-2">
  //             <button
  //               onClick={() => {
  //                 clearError();
  //                 if (mode) {
  //                   startInterviewSession();
  //                 }
  //               }}
  //               className="w-full bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
  //             >
  //               Try Again
  //             </button>
  //             <button
  //               onClick={() => {
  //                 resetInterview();
  //                 setStep('setup');
  //                 setMode(null);
  //                 clearError();
  //               }}
  //               className="w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
  //             >
  //               Start Over
  //             </button>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (!currentInterview || !currentRound) {
  //     return (
  //       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //         <div className="text-center">
  //           <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
  //           <p className="text-gray-600">Loading interview data...</p>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className="min-h-screen bg-gray-50">
  //       {/* Header */}
  //       <div className="bg-white shadow-sm px-4 py-4">
  //         <div className="max-w-6xl mx-auto">
  //           {/* Top row */}
  //           <div className="flex items-center justify-between mb-4">
  //             <div className="flex items-center space-x-4">
  //               <div className="flex items-center space-x-2">
  //                 <Clock className="w-5 h-5 text-blue-500" />
  //                 <span className="font-mono text-lg">{getFormattedTime()}</span>
  //               </div>
  //               <div className="text-sm text-gray-600">
  //                 Round {currentRoundIndex + 1} of {currentInterview.totalRounds}
  //               </div>
  //             </div>
              
  //             <div className="flex items-center space-x-4">
  //               <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
  //                 Progress: {Math.round(progress)}%
  //               </div>
  //               {(isSavingAnswer || isSubmitting) && (
  //                 <div className="flex items-center space-x-2 text-sm text-blue-600">
  //                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
  //                   <span>Saving...</span>
  //                 </div>
  //               )}
  //             </div>
  //           </div>

  //           {/* Rounds navigation */}
  //           <div className="flex space-x-2 overflow-x-auto pb-2">
  //             {currentInterview.rounds.map((round, index) => (
  //               <button
  //                 key={index}
  //                 onClick={() => handleRoundNavigation(index)}
  //                 className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
  //                   index === currentRoundIndex
  //                     ? 'bg-blue-500 text-white'
  //                     : index < currentRoundIndex
  //                     ? 'bg-green-100 text-green-700 hover:bg-green-200'
  //                     : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  //                 }`}
  //               >
  //                 {round.name}
  //                 {index < currentRoundIndex && <CheckCircle className="w-4 h-4 ml-1 inline" />}
  //               </button>
  //             ))}
  //           </div>
  //         </div>
  //       </div>

  //       <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
  //         {/* Video/Voice Section */}
  //         <div className="lg:col-span-1">
  //           <div className="bg-white rounded-2xl p-6 shadow-sm">
  //             <div className="text-center mb-4">
  //               <h3 className="font-semibold text-gray-900">
  //                 {mode === 'video' ? 'Video Interview' : 'Voice Interview'}
  //               </h3>
  //               <p className="text-sm text-gray-600">{currentRound.name}</p>
  //             </div>
              
  //             {mode === 'video' ? (
  //               <div className="relative">
  //                 <video
  //                   ref={videoRef}
  //                   autoPlay
  //                   muted
  //                   className="w-full h-64 bg-gray-200 rounded-lg object-cover"
  //                 />
  //                 <canvas
  //                   ref={canvasRef}
  //                   className="absolute top-0 left-0 w-full h-64 rounded-lg pointer-events-none"
  //                   style={{ opacity: 0.8 }}
  //                 />
                  
  //                 {/* Face Detection Status */}
  //                 <div className="absolute top-3 left-3 space-y-1">
  //                   <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
  //                     <div className={`w-2 h-2 rounded-full ${currentFaceData.faceDetected ? 'bg-green-400' : 'bg-red-400'}`}></div>
  //                     <span>Recording</span>
  //                   </div>
                    
  //                   {faceApiLoading && (
  //                     <div className="bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
  //                       <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
  //                       <span>Loading AI...</span>
  //                     </div>
  //                   )}
                    
  //                   {!faceApiLoaded && !faceApiLoading && (
  //                     <div className="bg-yellow-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
  //                       Basic Video Mode
  //                     </div>
  //                   )}
                    
  //                   {faceApiLoaded && currentFaceData.faceDetected && (
  //                     <div className="bg-green-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
  //                       AI Active ({currentFaceData.numFaces})
  //                     </div>
  //                   )}
                    
  //                   {faceApiLoaded && !currentFaceData.faceDetected && (
  //                     <div className="bg-orange-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
  //                       No Face Detected
  //                     </div>
  //                   )}
  //                 </div>

  //                 {/* Eye Contact Indicator */}
  //                 <div className="absolute top-3 right-3">
  //                   <div className={`p-1 rounded-full ${currentFaceData.eyeContact ? 'bg-green-500' : 'bg-gray-500'} bg-opacity-70`}>
  //                     {currentFaceData.eyeContact ? 
  //                       <Eye className="w-4 h-4 text-white" /> : 
  //                       <EyeOff className="w-4 h-4 text-white" />
  //                     }
  //                   </div>
  //                 </div>

  //                 {/* Emotion Indicators */}
  //                 {currentFaceData.faceDetected && (
  //                   <div className="absolute bottom-3 left-3 right-3">
  //                     <div className="bg-black bg-opacity-60 rounded p-2">
  //                       <div className="text-xs text-white mb-1">Live Emotions:</div>
  //                       <div className="grid grid-cols-4 gap-1 text-xs">
  //                         {Object.entries(currentFaceData.emotions).map(([emotion, value]) => (
  //                           <div key={emotion} className="text-center">
  //                             <div className="text-white capitalize">{emotion.slice(0, 4)}</div>
  //                             <div className="bg-gray-700 h-1 rounded">
  //                               <div 
  //                                 className="bg-blue-400 h-1 rounded transition-all duration-300"
  //                                 style={{ width: `${(value * 100)}%` }}
  //                               ></div>
  //                             </div>
  //                           </div>
  //                         ))}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             ) : (
  //               <div className="h-64 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
  //                 <div className="text-center text-white">
  //                   <MicIcon className="w-16 h-16 mx-auto mb-4" />
  //                   <p className="text-lg font-semibold">Voice Mode Active</p>
  //                   <p className="text-blue-100">Speak your answers clearly</p>
  //                 </div>
  //               </div>
  //             )}

  //             <div className="mt-4">
  //               <div className="bg-gray-50 rounded-lg p-3">
  //                 <h4 className="font-medium text-gray-900 mb-2">{currentRound.name}</h4>
  //                 <p className="text-sm text-gray-600 mb-2">{currentRound.description}</p>
  //                 <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
  //                   <span>Duration: {currentRound.duration} min</span>
  //                   <span>Questions: {currentRound.questions.length}</span>
  //                 </div>
                  
  //                 {/* Real-time Analysis for Video Mode */}
  //                 {mode === 'video' && (
  //                   <div className="border-t pt-2 mt-2">
  //                     <h5 className="text-xs font-medium text-gray-700 mb-2">Real-time Analysis</h5>
  //                     <div className="space-y-1 text-xs">
  //                       {faceApiLoading ? (
  //                         <div className="flex items-center space-x-2 text-blue-600">
  //                           <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
  //                           <span>Loading AI models...</span>
  //                         </div>
  //                       ) : faceApiLoaded ? (
  //                         <>
  //                           <div className="flex justify-between">
  //                             <span>Face Detection:</span>
  //                             <span className={currentFaceData.faceDetected ? 'text-green-600' : 'text-red-600'}>
  //                               {currentFaceData.faceDetected ? '✓ Active' : '✗ No Face'}
  //                             </span>
  //                           </div>
  //                           <div className="flex justify-between">
  //                             <span>Eye Contact:</span>
  //                             <span className={currentFaceData.eyeContact ? 'text-green-600' : 'text-yellow-600'}>
  //                               {currentFaceData.eyeContact ? '✓ Good' : '⚠ Look at Camera'}
  //                             </span>
  //                           </div>
  //                           <div className="flex justify-between">
  //                             <span>Primary Emotion:</span>
  //                             <span className="text-blue-600">
  //                               {(() => {
  //                                 const maxEmotion = Object.entries(currentFaceData.emotions)
  //                                   .reduce((max, [emotion, value]) => 
  //                                     value > max.value ? { emotion, value } : max, 
  //                                     { emotion: 'neutral', value: 0 }
  //                                   );
  //                                 return maxEmotion.emotion.charAt(0).toUpperCase() + maxEmotion.emotion.slice(1);
  //                               })()}
  //                             </span>
  //                           </div>
  //                         </>
  //                       ) : (
  //                         <div className="text-gray-500">
  //                           <div>✓ Video Recording Active</div>
  //                           <div>⚠ AI Analysis Unavailable</div>
  //                           <div className="text-xs mt-1 text-gray-400">
  //                             Interview will continue normally
  //                           </div>
  //                         </div>
  //                       )}
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         {/* Question and Answer Section */}
  //         <div className="lg:col-span-2">
  //           <div className="bg-white rounded-2xl p-6 shadow-sm">
  //             {currentQuestion && (
  //               <>
  //                 <div className="mb-6">
  //                   <div className="flex items-start space-x-3 mb-4">
  //                     <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
  //                       Q{currentQuestionIndex + 1}/{currentRound.questions.length}
  //                     </div>
  //                     <h2 className="text-lg font-semibold text-gray-900 flex-1">
  //                       {currentQuestion.question}
  //                     </h2>
  //                   </div>
  //                 </div>

  //                 <div className="mb-6">
  //                   <div className="flex items-center justify-between mb-3">
  //                     <label className="block text-sm font-medium text-gray-700">
  //                       Your Answer
  //                     </label>
  //                     {speechSupported && (
  //                       <div className="flex items-center space-x-2">
  //                         <button
  //                           onClick={isListening ? stopListening : startListening}
  //                           className={`p-2 rounded-lg transition-colors ${
  //                             isListening
  //                               ? 'bg-red-500 text-white hover:bg-red-600'
  //                               : 'bg-blue-500 text-white hover:bg-blue-600'
  //                           }`}
  //                           title={isListening ? 'Stop Voice Input' : 'Start Voice Input'}
  //                         >
  //                           {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
  //                         </button>
  //                         <span className="text-sm text-gray-500">
  //                           {isListening ? 'Listening...' : 'Voice Input'}
  //                         </span>
  //                         <button onClick={() => startTheCalls()}>Text To Speach</button>
  //                       </div>
  //                     )}
  //                   </div>
  //                   <textarea
  //                     ref={textareaRef}
  //                     value={currentAnswer}
  //                     onChange={handleTextareaChange}
  //                     onFocus={maintainTextareaFocus}
  //                     placeholder="Type your answer here or use voice input..."
  //                     className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
  //                     autoFocus
  //                   />
  //                   {isListening && (
  //                     <p className="text-sm text-blue-600 mt-2">🎤 Listening... Speak clearly into your microphone</p>
  //                   )}
  //                 </div>

  //                 <div className="flex items-center justify-between">
  //                   <div className="flex space-x-3">
  //                     <button
  //                       onClick={goToPreviousQuestion}
  //                       disabled={currentQuestionIndex === 0}
  //                       className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
  //                     >
  //                       Previous
  //                     </button>
                      
  //                     {currentQuestionIndex < currentRound.questions.length - 1 ? (
  //                       <button
  //                         onClick={handleAnswerSubmit}
  //                         disabled={!currentAnswer.trim()}
  //                         className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
  //                       >
  //                         <span>Next Question</span>
  //                         <ArrowRight className="w-4 h-4" />
  //                       </button>
  //                     ) : (
  //                       <button
  //                         onClick={handleAnswerSubmit}
  //                         disabled={!currentAnswer.trim()}
  //                         className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
  //                       >
  //                         Save Answer
  //                       </button>
  //                     )}
  //                   </div>

  //                   {currentQuestionIndex === currentRound.questions.length - 1 && (
  //                     <button
  //                       onClick={handleCompleteRound}
  //                       className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center space-x-2"
  //                     >
  //                       <CheckCircle className="w-4 h-4" />
  //                       <span>
  //                         {currentRoundIndex === currentInterview.rounds.length - 1 
  //                           ? 'Complete Interview' 
  //                           : 'Complete Round'
  //                         }
  //                       </span>
  //                     </button>
  //                   )}
  //                 </div>
  //               </>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // };


  // Remove ALL old face detection code from here
const InterviewPhase = () => {
  console.log("InterviewPhase started"); // This runs ONLY ONCE now!

  // Face detection hook
  const { 
    currentFaceData, 
    startFaceDetection, 
    stopFaceDetection 
  } = useFaceDetection({
    videoRef,
    canvasRef,
    currentInterviewId: currentInterview?._id,
    addVideoFrame,
    faceApiLoaded
  });

  useEffect(() => {
    if (mode === 'video' && !videoInitializedRef.current) {
      videoInitializedRef.current = true;
      
      initializeVideoStream(
        videoRef, 
        mediaStreamRef, 
        startFaceDetection,  // Use hook's function
        faceApiLoaded
      ).catch(err => {
        console.error("Video init failed:", err);
        setError(err.message);
      });

      // Cleanup
      return () => {
        stopFaceDetection(); // Use hook's cleanup
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        if (videoFrameIntervalRef.current) {
          clearInterval(videoFrameIntervalRef.current);
          videoFrameIntervalRef.current = null;
        }
        videoInitializedRef.current = false;
      };
    }
  }, [mode, startFaceDetection, stopFaceDetection, faceApiLoaded]);

  // ... ALL OTHER EXISTING CODE REMAINS THE SAME ...

  const currentRound = getCurrentRound();
  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  
  const handleAnswerSubmit = async (isNextQuestion = true) => {
    if (!currentAnswer.trim() || !currentInterview) return;

    setIsSavingAnswer(true);
    try {
      const token = getToken();
      
      const response = await submitSingleAnswer(
        currentInterview._id, 
        currentRoundIndex, 
        currentQuestionIndex, 
        currentAnswer.trim(), 
        token,
        codeRef.current
      );

      console.log('Answer submitted successfully:', response);
      
      updateInterviewAnswer(currentRoundIndex, currentQuestionIndex, currentAnswer.trim());
      setCurrentAnswer('');
      
      if (isNextQuestion && currentRound && currentQuestionIndex < currentRound.questions.length - 1) {
        goToNextQuestion();
      }
      
      maintainTextareaFocus();
    } catch (error: any) {
      console.error('Failed to submit answer:', error);
      setError(error.message || 'Failed to submit answer. Please try again.');
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleSaveAnswer = () => {
    console.log("Hitting");
    handleAnswerSubmit(false);
  };

  const handleNextQuestion = () => {
    console.log("next");
    handleAnswerSubmit(true);
  };

  const handleCompleteRound = async () => {
    if (!currentInterview || !currentRound) return;
    
    try {
      clearError();
      const token = getToken();
      
      if (currentAnswer.trim()) {
        await handleSaveAnswer();
      }

      if (currentRoundIndex < currentInterview.rounds.length - 1) {
        setCurrentRound(currentRoundIndex + 1);
        setCurrentAnswer('');
      } else {
        // Complete interview - move to evaluation
        stopFaceDetection(); // STOP face detection
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
          mediaStreamRef.current = null;
        }
        if (videoFrameIntervalRef.current) {
          clearInterval(videoFrameIntervalRef.current);
          videoFrameIntervalRef.current = null;
        }
        
        setStep('evaluation');
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

  // ... ALL LOADING/ERROR HANDLING REMAINS THE SAME ...

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

  // ... ALL OTHER JSX REMAINS EXACTLY THE SAME ...
  // Just replace currentFaceData references - they work identically!

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <div className="max-w-6xl mx-auto">
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
              {(isSavingAnswer || isSubmitting) && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>

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
        {/* Video Section - SAME JSX */}
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
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-64 rounded-lg pointer-events-none"
                  style={{ opacity: 0.8 }}
                />
                
                {/* ALL STATUS INDICATORS - SAME JSX */}
                <div className="absolute top-3 left-3 space-y-1">
                  <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <div className={`w-2 h-2 rounded-full ${currentFaceData.faceDetected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span>Recording</span>
                  </div>
                  
                  {faceApiLoading && (
                    <div className="bg-blue-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                      <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                      <span>Loading AI...</span>
                    </div>
                  )}
                  
                  {!faceApiLoaded && !faceApiLoading && (
                    <div className="bg-yellow-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                      Basic Video Mode
                    </div>
                  )}
                  
                  {faceApiLoaded && currentFaceData.faceDetected && (
                    <div className="bg-green-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                      AI Active ({currentFaceData.numFaces})
                    </div>
                  )}
                  
                  {faceApiLoaded && !currentFaceData.faceDetected && (
                    <div className="bg-orange-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                      No Face Detected
                    </div>
                  )}
                </div>

                <div className="absolute top-3 right-3">
                  <div className={`p-1 rounded-full ${currentFaceData.eyeContact ? 'bg-green-500' : 'bg-gray-500'} bg-opacity-70`}>
                    {currentFaceData.eyeContact ? 
                      <Eye className="w-4 h-4 text-white" /> : 
                      <EyeOff className="w-4 h-4 text-white" />
                    }
                  </div>
                </div>

                {/* {currentFaceData.faceDetected && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="bg-black bg-opacity-60 rounded p-2">
                      <div className="text-xs text-white mb-1">Live Emotions:</div>
                      <div className="grid grid-cols-4 gap-1 text-xs">
                        {Object.entries(currentFaceData.emotions).map(([emotion, value]) => (
                          <div key={emotion} className="text-center">
                            <div className="text-white capitalize">{emotion.slice(0, 4)}</div>
                            <div className="bg-gray-700 h-1 rounded">
                              <div 
                                className="bg-blue-400 h-1 rounded transition-all duration-300"
                                style={{ width: `${(value * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )} */}
              </div>
            ) : (
              // Voice mode JSX - SAME
              <div className="h-64 bg-gradient-to-br from-blue-500 to-green-600 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <MicIcon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-semibold">Voice Mode Active</p>
                  <p className="text-blue-100">Speak your answers clearly</p>
                </div>
              </div>
            )}

            {/* Round info and analysis - SAME JSX */}
            <div className="mt-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-900 mb-2">{currentRound.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{currentRound.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <span>Duration: {currentRound.duration} min</span>
                  <span>Questions: {currentRound.questions.length}</span>
                </div>
                
                {mode === 'video' && (
                  <div className="border-t pt-2 mt-2">
                    <h5 className="text-xs font-medium text-gray-700 mb-2">Real-time Analysis</h5>
                    <div className="space-y-1 text-xs">
                      {faceApiLoading ? (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                          <span>Loading AI models...</span>
                        </div>
                      ) : faceApiLoaded ? (
                        <>
                          <div className="flex justify-between">
                            <span>Face Detection:</span>
                            <span className={currentFaceData.faceDetected ? 'text-green-600' : 'text-red-600'}>
                              {currentFaceData.faceDetected ? '✓ Active' : '✗ No Face'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Eye Contact:</span>
                            <span className={currentFaceData.eyeContact ? 'text-green-600' : 'text-yellow-600'}>
                              {currentFaceData.eyeContact ? '✓ Good' : '⚠ Look at Camera'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Primary Emotion:</span>
                            <span className="text-blue-600">
                              {(() => {
                                const maxEmotion = Object.entries(currentFaceData.emotions)
                                  .reduce((max, [emotion, value]) => 
                                    value > max.value ? { emotion, value } : max, 
                                    { emotion: 'neutral', value: 0 }
                                  );
                                return maxEmotion.emotion.charAt(0).toUpperCase() + maxEmotion.emotion.slice(1);
                              })()}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">
                          <div>✓ Video Recording Active</div>
                          <div>⚠ AI Analysis Unavailable</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Question and Answer Section - SAME JSX */}
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
                    <label className="block text-sm font-medium text-gray-700">Your Answer</label>
                    {speechSupported && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={isListening ? stopListening : startListening}
                          className={`p-2 rounded-lg transition-colors ${
                            isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                        <span className="text-sm text-gray-500">
                          {isListening ? 'Listening...' : 'Voice Input'}
                        </span>
                        <button onClick={() => startTheCalls()}>Text To Speech</button>
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

                              {/* Monaco Code Editor Installed here */}
            <div className="p-4">
              <select
                onChange={(e) => setSelectedOption(e.target.value)}
                className="border px-3 py-2 rounded"
            >
              <option value="">Select Option</option>
              <option value="show">Show Editor</option>
              <option value="hide">Hide Editor</option>
            </select>
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


      {/* Monaco edtiro part-2 */}
      {selectedOption === "show" && (
                <div className="mt-4 border rounded-lg shadow">
                  <Editor
                    height="300px"
                    defaultLanguage="javascript"
                    // defaultValue="// Write some code here..."
                    theme="vs-dark"
                    defaultValue={codeRef.current}
                    onChange={handleEditorChange}
                  />
              </div>
              )}
                      </div>
                    </div>
    </div>
  );
};

  // NEW: Evaluation Phase Component
  const EvaluationPhase = () => {
    const handleEvaluateAndComplete = async () => {
      if (!currentInterview) return;

      setIsEvaluating(true);
      clearError();

      try {
        const token = getToken();
        
        // Step 1: Evaluate interview
        console.log('Starting interview evaluation...');
        await evaluateInterview(currentInterview._id, token);
        
        // Step 2: Generate summary
        console.log('Generating interview summary...');
        setIsGeneratingSummary(true);
        await generateInterviewSummary(currentInterview._id, token);
        
        // Move to complete phase
        setStep('complete');
      } catch (error: any) {
        console.error('Failed to evaluate/summarize interview:', error);
        setError(error.message || 'Failed to process interview results. Please try again.');
      } finally {
        setIsEvaluating(false);
        setIsGeneratingSummary(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-sm text-center"
          >
            <div className="mb-6">
              {isEvaluating && !isGeneratingSummary ? (
                <>
                  <BarChart className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Evaluating Your Performance</h2>
                  <p className="text-gray-600">Our AI is analyzing your answers and responses...</p>
                </>
              ) : isGeneratingSummary ? (
                <>
                  <MessageCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Summary</h2>
                  <p className="text-gray-600">Creating personalized feedback and recommendations...</p>
                </>
              ) : (
                <>
                  <TrendingUp className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Interview Analysis Ready</h2>
                  <p className="text-gray-600 mb-6">
                    Your interview has been completed successfully. Click below to get detailed analysis and feedback.
                  </p>
                  <button
                    onClick={handleEvaluateAndComplete}
                    className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BarChart className="w-5 h-5" />
                    <span>Get My Results</span>
                  </button>
                </>
              )}
            </div>

            {(isEvaluating || isGeneratingSummary) && (
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isEvaluating && !isGeneratingSummary ? 'Analyzing responses...' : 'Generating summary...'}
                </span>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <button
                  onClick={() => {
                    clearError();
                    handleEvaluateAndComplete();
                  }}
                  className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  resetInterview();
                  setStep('setup');
                  setMode(null);
                  clearError();
                }}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Start New Interview Instead
              </button>
            </div>
          </motion.div>
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
      case 'evaluation':
        return <EvaluationPhase />;
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