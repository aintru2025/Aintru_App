import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Profile = () => {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Profile' }
      });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          Profile
        </motion.h1>
        <div className="bg-white rounded-2xl p-8 shadow-sm flex flex-col items-center">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-24 h-24 rounded-full border-4 border-enteru-500 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-enteru-500 to-enteru-700 flex items-center justify-center text-white font-bold text-4xl mb-4">
              {user?.name ? user.name[0] : user?.email[0]}
            </div>
          )}
          <div className="w-full">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Name</label>
              <input type="text" value={user?.name || ''} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-enteru-500" readOnly />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <input type="email" value={user?.email || ''} className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-enteru-500" readOnly />
            </div>
            {/* Add more editable fields as needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 