import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  GraduationCap, Briefcase, ArrowLeft
} from 'lucide-react';
import ExamPreparation from './ExamPreparation';
import JobInterview from './JobInterview';

type PreparationType = 'exam' | 'job' | null;

const MockInterview: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [preparationType, setPreparationType] = useState<PreparationType>(null);

  // Auth check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Mock Interview' }
      });
    }
  }, [isAuthenticated, navigate]);

  const handleBackToSelection = () => {
    setPreparationType(null);
  };

  // Main selection screen
  const PreparationTypeSelection = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Mock Interview</h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose your preparation type and start practicing with AI-powered interviews
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPreparationType('exam')}
            className="group bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
              <GraduationCap className="w-12 h-12" />
            </div>
            <span className="font-bold text-2xl mb-3">Exam Preparation</span>
            <span className="text-purple-100 text-center leading-relaxed">
              Practice for competitive exams, entrance tests, or academic interviews with AI-generated questions
            </span>
            <div className="mt-6 flex items-center text-purple-200 text-sm">
              <span>Get Started</span>
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setPreparationType('job')}
            className="group bg-gradient-to-br from-blue-500 to-green-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="bg-white/20 p-4 rounded-full mb-4 group-hover:bg-white/30 transition-colors">
              <Briefcase className="w-12 h-12" />
            </div>
            <span className="font-bold text-2xl mb-3">Job Interview</span>
            <span className="text-blue-100 text-center leading-relaxed">
              Practice for job interviews, internships, or career opportunities with realistic mock interviews
            </span>
            <div className="mt-6 flex items-center text-blue-200 text-sm">
              <span>Get Started</span>
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </div>
          </motion.button>
        </motion.div>

        {/* Features section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose AI Mock Interview?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold">AI</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">AI-Powered Questions</h3>
              <p className="text-gray-600 text-sm">
                Get personalized questions based on your field and experience level
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold">📹</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Video & Voice Options</h3>
              <p className="text-gray-600 text-sm">
                Choose between video interviews with behavioral analysis or voice-only practice
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Detailed Feedback</h3>
              <p className="text-gray-600 text-sm">
                Receive comprehensive performance analysis and improvement suggestions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">10K+</div>
            <div className="text-gray-600 text-sm">Interviews Completed</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
            <div className="text-gray-600 text-sm">Success Rate</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">50+</div>
            <div className="text-gray-600 text-sm">Question Types</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
            <div className="text-gray-600 text-sm">Available</div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600 mb-4">Ready to ace your next interview?</p>
          <p className="text-sm text-gray-500">Choose your preparation type above to get started</p>
        </motion.div>
      </div>
    </div>
  );

  // Main render logic
  return (
    <AnimatePresence mode="wait">
      {!preparationType && (
        <motion.div
          key="selection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <PreparationTypeSelection />
        </motion.div>
      )}
      
      {preparationType === 'exam' && (
        <motion.div
          key="exam"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <ExamPreparation onBack={handleBackToSelection} />
        </motion.div>
      )}
      
      {preparationType === 'job' && (
        <motion.div
          key="job"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <JobInterview onBack={handleBackToSelection} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MockInterview;