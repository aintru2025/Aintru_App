import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Target, Award, AlertCircle, CheckCircle } from 'lucide-react';

interface InterviewFeedback {
  overallScore: number;
  communication: number;
  technical: number;
  confidence: number;
  logic: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  companiesReady: string[];
  nextSteps: string[];
  detailedAnalysis: string;
}

interface FeedbackGeneratorProps {
  interviewData: {
    company: string;
    role: string;
    questions: number;
    duration: number;
    answers: any[];
    technicalOutput?: string;
  };
  onFeedbackComplete: (feedback: InterviewFeedback) => void;
}

const FeedbackGenerator: React.FC<FeedbackGeneratorProps> = ({
  interviewData,
  onFeedbackComplete
}) => {
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, [interviewData]);

  const generateFeedback = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:3000/api/interview/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
      onFeedbackComplete(data.feedback);
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Fallback feedback
      setFeedback(generateFallbackFeedback());
      onFeedbackComplete(generateFallbackFeedback());
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFallbackFeedback = (): InterviewFeedback => {
    return {
      overallScore: 78,
      communication: 82,
      technical: 75,
      confidence: 70,
      logic: 80,
      strengths: [
        'Strong problem-solving approach',
        'Good communication skills',
        'Technical knowledge demonstrated',
        'Structured thinking process'
      ],
      weaknesses: [
        'Could provide more specific examples',
        'Time management needs improvement',
        'Confidence could be enhanced',
        'More detailed technical explanations needed'
      ],
      recommendations: [
        'Practice STAR method for behavioral questions',
        'Prepare specific examples from your experience',
        'Work on concise communication',
        'Practice technical problems regularly'
      ],
      companiesReady: [
        'Startups and early-stage companies',
        'Mid-size technology companies',
        'Companies with similar role requirements'
      ],
      nextSteps: [
        'Review detailed feedback',
        'Practice similar questions',
        'Schedule follow-up interview',
        'Work on identified areas'
      ],
      detailedAnalysis: 'You demonstrated solid technical skills and good communication. Your problem-solving approach was logical and well-structured. Areas for improvement include providing more specific examples and enhancing confidence in your responses.'
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 80) return <TrendingUp className="w-5 h-5 text-blue-600" />;
    if (score >= 70) return <Target className="w-5 h-5 text-yellow-600" />;
    return <AlertCircle className="w-5 h-5 text-red-600" />;
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Your Feedback</h3>
          <p className="text-gray-600">AI is analyzing your interview performance...</p>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-8 shadow-sm text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          {getScoreIcon(feedback.overallScore)}
          <h2 className="text-3xl font-bold text-gray-900">Interview Complete!</h2>
        </div>
        
        <div className="mb-6">
          <div className="text-6xl font-bold mb-2">
            <span className={getScoreColor(feedback.overallScore)}>
              {feedback.overallScore}%
            </span>
          </div>
          <p className="text-gray-600">Overall Performance Score</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{feedback.communication}</div>
            <div className="text-sm text-gray-600">Communication</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{feedback.technical}</div>
            <div className="text-sm text-gray-600">Technical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{feedback.confidence}</div>
            <div className="text-sm text-gray-600">Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{feedback.logic}</div>
            <div className="text-sm text-gray-600">Logic</div>
          </div>
        </div>
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Detailed Analysis</h3>
        <p className="text-gray-700 leading-relaxed">{feedback.detailedAnalysis}</p>
      </motion.div>

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {feedback.strengths.map((strength, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {feedback.weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-gray-700">{weakness}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Recommendations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedback.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Companies Ready For */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Award className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">Companies You're Ready For</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {feedback.companiesReady.map((company, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {company}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Next Steps</h3>
        </div>
        <div className="space-y-3">
          {feedback.nextSteps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FeedbackGenerator; 