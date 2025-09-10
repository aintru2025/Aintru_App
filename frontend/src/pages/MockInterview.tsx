import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Mic, Video, Upload, User, ArrowRight } from 'lucide-react';
import InterviewFlowSetup from '../components/InterviewFlowSetup';
import InterviewExecution from '../components/InterviewExecution';

const AI_AVATAR = 'https://cdn.pixabay.com/photo/2017/01/31/13/14/avatar-2026510_1280.png'; // Placeholder avatar

const MockInterview = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<'setup' | 'mode-selection' | 'interview' | 'complete'>('setup');
  const [setupData, setSetupData] = useState<any>(null);
  const [mode, setMode] = useState<'voice' | 'video' | null>(null);
  const [interviewResults, setInterviewResults] = useState<any>(null);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Mock Interview' }
      });
    }
  }, [isAuthenticated, navigate]);

  // Handle setup completion
  const handleSetupComplete = (data: any) => {
    setSetupData(data);
    setStep('mode-selection');
  };

  // Handle interview mode selection
  const handleModeSelect = (selectedMode: 'voice' | 'video') => {
    setMode(selectedMode);
    setStep('interview');
  };

  // Handle interview completion
  const handleInterviewComplete = (results: any) => {
    setInterviewResults(results);
    setStep('complete');
  };

  // If still in setup phase, show the setup component
  if (step === 'setup') {
    return <InterviewFlowSetup onSetupComplete={handleSetupComplete} />;
  }

  // If setup is complete, show interview mode selection
  if (step === 'mode-selection') {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900 mb-6 text-center"
          >
            AI Mock Interview
          </motion.h1>
          
          {/* Interview Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-sm mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interview Summary</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Company:</span>
                <p className="text-gray-900">{setupData?.company}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Role:</span>
                <p className="text-gray-900">{setupData?.role}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Experience:</span>
                <p className="text-gray-900">{setupData?.experienceLevel}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Rounds:</span>
                <p className="text-gray-900">{setupData?.interviewFlow?.rounds?.length || 0} rounds</p>
        </div>
          </div>
          </motion.div>

          {/* Mode Selection */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-xl font-semibold mb-6">Choose Interview Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <button
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-md hover:scale-105 transition-transform"
                onClick={() => handleModeSelect('voice')}
              >
                <Mic className="w-10 h-10 mb-3" />
                <span className="font-bold text-lg mb-1">Voice Mock Interview</span>
                <span className="text-blue-100 text-sm">Start with voice if you feel nervous about video. Practice answering with confidence.</span>
              </button>
              <button
                className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-md hover:scale-105 transition-transform"
                onClick={() => handleModeSelect('video')}
              >
                <Video className="w-10 h-10 mb-3" />
                <span className="font-bold text-lg mb-1">Video Mock Interview</span>
                <span className="text-pink-100 text-sm">Face our AI HR visually, just like a real interview. Get feedback on your presence and confidence.</span>
              </button>
          </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If interview mode is selected, show the interview execution
  if (step === 'interview' && setupData && mode) {
    return (
      <InterviewExecution
        setupData={setupData}
        mode={mode}
        onInterviewComplete={handleInterviewComplete}
      />
    );
  }

  // If interview is complete, show results
  if (step === 'complete' && interviewResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Complete!</h1>
            <p className="text-gray-600 mb-8">
              Great job completing your mock interview. Here's your performance summary.
            </p>
            
            {/* Results Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Performance Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {interviewResults.overallScore || 0}/10
                  </div>
                  <div className="text-sm text-gray-600">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {interviewResults.confidence || 0}/10
              </div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {interviewResults.duration || 0}min
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setStep('setup')}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Start New Interview
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Go to Dashboard
              </button>
              </div>
            </motion.div>
      </div>
    </div>
  );
  }

  return null;
};

export default MockInterview;