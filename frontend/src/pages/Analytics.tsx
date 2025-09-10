import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar, 
  Star, 
  Award, 
  Clock, 
  Users, 
  Building2, 
  Briefcase,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';

const Analytics = () => {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');

  // Mock data for analytics
  const mockInterviews = [
    {
      id: 1,
      date: '2024-01-15',
      company: 'Google',
      role: 'AI Engineer',
      type: 'Technical',
      duration: 45,
      score: 85,
      feedback: {
        strengths: ['Strong technical knowledge', 'Clear communication', 'Good problem-solving approach'],
        improvements: ['Practice system design questions', 'Work on time management', 'Improve behavioral responses'],
        overallRating: 4.2
      },
      questions: 12,
      difficulty: 'Hard'
    },
    {
      id: 2,
      date: '2024-01-10',
      company: 'Microsoft',
      role: 'Software Engineer',
      type: 'Behavioral',
      duration: 30,
      score: 78,
      feedback: {
        strengths: ['Good STAR method usage', 'Relevant examples', 'Confident delivery'],
        improvements: ['More specific metrics in examples', 'Better conclusion statements'],
        overallRating: 3.9
      },
      questions: 8,
      difficulty: 'Medium'
    },
    {
      id: 3,
      date: '2024-01-08',
      company: 'Google',
      role: 'AI Engineer',
      type: 'Technical',
      duration: 50,
      score: 82,
      feedback: {
        strengths: ['Improved system design', 'Better time management', 'Strong technical depth'],
        improvements: ['Practice more coding problems', 'Work on edge cases'],
        overallRating: 4.1
      },
      questions: 15,
      difficulty: 'Hard'
    },
    {
      id: 4,
      date: '2024-01-05',
      company: 'Amazon',
      role: 'Data Scientist',
      type: 'Case Study',
      duration: 40,
      score: 75,
      feedback: {
        strengths: ['Good analytical thinking', 'Structured approach'],
        improvements: ['More data-driven insights', 'Better business understanding'],
        overallRating: 3.7
      },
      questions: 6,
      difficulty: 'Medium'
    }
  ];

  const progressData = {
    'Google AI Engineer': [
      { date: '2024-01-08', score: 82 },
      { date: '2024-01-15', score: 85 }
    ],
    'Microsoft Software Engineer': [
      { date: '2024-01-10', score: 78 }
    ],
    'Amazon Data Scientist': [
      { date: '2024-01-05', score: 75 }
    ]
  };

  const overallStats = {
    totalInterviews: mockInterviews.length,
    averageScore: Math.round(mockInterviews.reduce((acc, interview) => acc + interview.score, 0) / mockInterviews.length),
    totalTime: mockInterviews.reduce((acc, interview) => acc + interview.duration, 0),
    companies: [...new Set(mockInterviews.map(interview => interview.company))].length,
    improvement: '+7%'
  };

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Analytics' }
      });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Analytics & Progress
          </h1>
          <p className="text-gray-600">
            Track your interview performance, confidence, and improvement over time
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Interviews</option>
              <option value="google">Google</option>
              <option value="microsoft">Microsoft</option>
              <option value="amazon">Amazon</option>
            </select>
          </div>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </motion.div>

        {/* Overall Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.averageScore}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {overallStats.improvement}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Practice Time</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.totalTime}m</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Companies Practiced</p>
                <p className="text-2xl font-bold text-gray-900">{overallStats.companies}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Charts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        >
          {/* Overall Progress Chart */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
              Overall Progress
            </h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Progress chart will be displayed here</p>
                <p className="text-sm text-gray-400">Showing improvement over time</p>
              </div>
            </div>
          </div>

          {/* Company-Specific Progress */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Company-Specific Progress
            </h3>
            <div className="space-y-4">
              {Object.entries(progressData).map(([companyRole, data]) => (
                <div key={companyRole} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{companyRole}</h4>
                    <span className="text-sm text-gray-500">{data.length} interviews</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (data[data.length - 1]?.score || 0))}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {data[data.length - 1]?.score || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Recent Interviews */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-500" />
              Recent Mock Interviews
            </h3>
            <button className="flex items-center text-sm text-blue-600 hover:text-blue-700">
              <Download className="w-4 h-4 mr-1" />
              Export Report
            </button>
          </div>
          
          <div className="divide-y divide-gray-200">
            {mockInterviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {interview.company[0]}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{interview.company} - {interview.role}</h4>
                      <p className="text-sm text-gray-500">{interview.type} Interview • {interview.duration} minutes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl font-bold text-gray-900">{interview.score}%</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(interview.feedback.overallRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{interview.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-green-700 mb-2 flex items-center">
                      <Award className="w-4 h-4 mr-1" />
                      Strengths
                    </h5>
                    <ul className="space-y-1">
                      {interview.feedback.strengths.map((strength, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-orange-700 mb-2 flex items-center">
                      <Target className="w-4 h-4 mr-1" />
                      Areas for Improvement
                    </h5>
                    <ul className="space-y-1">
                      {interview.feedback.improvements.map((improvement, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-start">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {interview.questions} questions
                    </span>
                    <span className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-1" />
                      {interview.difficulty}
                    </span>
                  </div>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 text-sm">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics; 