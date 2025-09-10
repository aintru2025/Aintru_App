import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  User, 
  Target, 
  BookOpen, 
  TrendingUp, 
  Mic, 
  FileText, 
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  Clock,
  BarChart3,
  Activity,
  TrendingUp as TrendingUpIcon
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Mock data for stats
  const stats = {
    mockInterviews: 0,
    practiceSessions: 0,
    successRate: 0,
    totalTime: 0
  };

  // Mock performance data for the graph
  const performanceData = [
    { date: 'Week 1', score: 65, interviews: 2 },
    { date: 'Week 2', score: 72, interviews: 3 },
    { date: 'Week 3', score: 68, interviews: 1 },
    { date: 'Week 4', score: 78, interviews: 4 },
    { date: 'Week 5', score: 82, interviews: 3 },
    { date: 'Week 6', score: 85, interviews: 5 },
    { date: 'Week 7', score: 88, interviews: 4 },
    { date: 'Week 8', score: 91, interviews: 6 }
  ];

  const maxScore = Math.max(...performanceData.map(d => d.score));
  const minScore = Math.min(...performanceData.map(d => d.score));

    return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative mb-12"
        >
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl">
            <div className="flex items-center space-x-6">
            <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.4, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-yellow-800" />
                </div>
              </motion.div>
              <div>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-4xl font-bold text-gray-900 mb-2"
                >
                  Welcome back, {user?.name}! 👋
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-gray-600 text-lg"
                >
                  Ready to ace your next interview? Let's get started!
                </motion.p>
              </div>
                </div>
              </div>
            </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Mock Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{stats.mockInterviews}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: -10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-150"
          >
            <div className="flex items-center justify-between">
                  <div>
                <p className="text-gray-600 text-sm font-medium">Total Time</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTime}m</p>
                  </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
                    </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-xl mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Performance Overview
              </h3>
              <p className="text-gray-600 text-sm">Your interview performance over time</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Score</span>
              </div>
            </div>
          </div>

          {/* Graph Container */}
          <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-4 bottom-4 w-8 flex flex-col justify-between text-xs text-gray-500">
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>

            {/* Graph Area */}
            <div className="ml-10 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0">
                {[0, 20, 40, 60, 80, 100].map((value, index) => (
                  <div
                    key={index}
                    className="absolute w-full border-t border-gray-200"
                    style={{ bottom: `${value}%` }}
                  ></div>
                ))}
              </div>

              {/* Performance Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.4, ease: "easeInOut" }}
                  d={performanceData.map((point, index) => {
                    const x = (index / (performanceData.length - 1)) * 100;
                    const y = 100 - ((point.score - minScore) / (maxScore - minScore)) * 80 - 10;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* Data Points */}
              {performanceData.map((point, index) => {
                const x = (index / (performanceData.length - 1)) * 100;
                const y = 100 - ((point.score - minScore) / (maxScore - minScore)) * 80 - 10;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.08, duration: 0.2 }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform cursor-pointer group">
                      {/* Tooltip */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        <div className="font-medium">Week {index + 1}</div>
                        <div>Score: {point.score}%</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-1">
                {performanceData.map((point, index) => (
                  <span key={index} className="text-center">
                    W{index + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3"
            >
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600">Best Score</p>
                <p className="text-lg font-bold text-blue-600">{maxScore}%</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3"
            >
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600">Total Interviews</p>
                <p className="text-lg font-bold text-green-600">
                  {performanceData.reduce((sum, d) => sum + d.interviews, 0)}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
              className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3"
            >
              <div className="text-center">
                <p className="text-xs font-medium text-gray-600">Average Score</p>
                <p className="text-lg font-bold text-purple-600">
                  {Math.round(performanceData.reduce((sum, d) => sum + d.score, 0) / performanceData.length)}%
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    <motion.div
            initial={{ opacity: 0, x: -20, rotateY: -10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            whileHover={{ scale: 1.02, rotateY: 5, z: 50 }}
            onClick={() => navigate('/mock-interview')}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-6">
        <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25"
              >
                <Mic className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  Start Mock Interview
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  Practice with AI-powered interview questions and get instant feedback
                </p>
                <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                  <span className="font-medium">Begin Practice</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
          </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            whileHover={{ scale: 1.02, rotateY: -5, z: 50 }}
            onClick={() => navigate('/resume-builder')}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center space-x-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25"
              >
                <FileText className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  Resume Builder
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  Create and optimize your resume with AI-powered suggestions
                </p>
                <div className="flex items-center text-green-600 group-hover:text-green-700 transition-colors">
                  <span className="font-medium">Build Resume</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
          </div>
          </div>
        </motion.div>
      </div>


      </main>
    </div>
  );
};

export default Dashboard;