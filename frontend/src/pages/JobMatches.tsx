import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Briefcase, ArrowRight } from 'lucide-react';

const JobMatches = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Job Matches' }
      });
    }
  }, [isAuthenticated, navigate]);

  const jobs = [
    { company: 'Google', role: 'Software Engineer', match: 95 },
    { company: 'Meta', role: 'Product Manager', match: 91 },
    { company: 'Amazon', role: 'Data Scientist', match: 89 },
  ];
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Job Matches
        </motion.h1>
        <p className="text-gray-600 mb-8">Discover companies and roles that fit your skills and performance.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center mb-2">
                  <Briefcase className="w-6 h-6 text-blue-500 mr-2" />
                  <span className="font-semibold text-gray-900 text-lg">{job.company}</span>
                </div>
                <div className="text-gray-700 mb-2">{job.role}</div>
                <div className="text-green-600 font-bold">{job.match}% Match</div>
              </div>
              <button className="mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-blue-600 hover:to-blue-700 transition-colors">
                <span>Apply</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobMatches; 