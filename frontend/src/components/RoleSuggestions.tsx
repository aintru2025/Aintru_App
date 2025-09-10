import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Check, Plus, Edit3 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface RoleSuggestionsProps {
  company: string;
  experience?: number | string;
  onRoleSelect: (role: string) => void;
}

const RoleSuggestions: React.FC<RoleSuggestionsProps> = ({
  company, 
  experience = 1, 
  onRoleSelect 
}) => {
  const { getToken } = useAuthStore();
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRole, setCustomRole] = useState('');

  useEffect(() => {
    if (company) {
      fetchRoleSuggestions();
    }
  }, [company, experience]);

  const fetchRoleSuggestions = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3000/api/interviewFlow/role-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          company, 
          experience: typeof experience === 'string' ? experience : `${experience} years` 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
      } else {
        throw new Error('Failed to fetch role suggestions');
      }
    } catch (error) {
      console.error('Error fetching role suggestions:', error);
      setError('Failed to load role suggestions');
      // Fallback roles
      setRoles([
        'Software Engineer',
        'Data Scientist', 
        'Product Manager',
        'DevOps Engineer',
        'Frontend Developer',
        'Backend Developer'
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    setShowCustomInput(false);
    setCustomRole('');
    onRoleSelect(role);
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      handleRoleSelect(customRole.trim());
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading roles for {company}...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <p className="text-yellow-800 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Available Roles at {company}
        </h3>
        <p className="text-sm text-gray-600">
          Select the role you're applying for or add a custom role
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roles.map((role, index) => (
            <motion.button
            key={role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            onClick={() => handleRoleSelect(role)}
            className={`p-4 border-2 rounded-lg transition-all duration-200 flex items-center justify-between ${
              selectedRole === role
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center">
              <Briefcase className="h-5 w-5 mr-3 text-gray-400" />
              <span className="font-medium">{role}</span>
                </div>
            {selectedRole === role && (
              <Check className="h-5 w-5 text-blue-500" />
            )}
            </motion.button>
          ))}
      </div>

      {/* Custom Role Input */}
      {!showCustomInput ? (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowCustomInput(true)}
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex items-center justify-center"
        >
          <Plus className="h-5 w-5 mr-2 text-gray-400" />
          <span className="font-medium text-gray-600">Add Custom Role</span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50"
        >
          <div className="flex items-center mb-3">
            <Edit3 className="h-5 w-5 mr-2 text-blue-500" />
            <span className="font-medium text-blue-700">Enter Custom Role</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customRole}
              onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g., Senior Frontend Developer, ML Engineer, etc."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
            />
            <button
              onClick={handleCustomRoleSubmit}
              disabled={!customRole.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomRole('');
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {selectedRole && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-green-800">
                Selected: <strong>{selectedRole}</strong> at <strong>{company}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                setSelectedRole('');
                onRoleSelect('');
              }}
              className="text-sm text-green-600 hover:text-green-800 underline"
            >
              Change
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RoleSuggestions; 