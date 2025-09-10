import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const Onboarding = () => {
  const [formData, setFormData] = useState({
    surname: '',
    educationLevel: '',
    userType: '',
    password: '',
    confirmPassword: ''
  });
  const [userData, setUserData] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  // Password validation
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const passwordValidation = validatePassword(formData.password);

  // Get user data from navigation state
  useEffect(() => {
    if (location.state?.userData && location.state?.isNewUser) {
      setUserData(location.state.userData);
      setIsNewUser(location.state.isNewUser);
    } else {
      // If no user data, redirect to get started
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  const createUserAccount = async () => {
    if (!userData) return;
    
    // Validate password
    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create user account with password
      const signupRes = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${userData.name} ${formData.surname}`.trim(),
          email: userData.email,
          phone: userData.phone,
          password: formData.password
        }),
      });
      
      if (!signupRes.ok) {
        const errorData = await signupRes.json();
        throw new Error(errorData.error || 'Account creation failed');
      }
      
      // Complete profile with basic details
      const profileRes = await fetch('http://localhost:3000/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surname: formData.surname,
          educationLevel: formData.educationLevel,
          userType: formData.userType,
          isStudent: formData.userType === 'student',
          email: userData.email,
          phone: userData.phone
        }),
      });
      
      if (!profileRes.ok) {
        const errorData = await profileRes.json();
        throw new Error(errorData.error || 'Profile completion failed');
      }
      
      // Login the user
      const loginRes = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: formData.password
        }),
      });
      
      if (!loginRes.ok) {
        throw new Error('Auto-login failed');
      }
      
      const loginData = await loginRes.json();
      login(loginData.user, loginData.token);
      
      // Redirect to dashboard
      navigate('/dashboard');
      
    } catch (err: any) {
      setError(err.message || 'Account setup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.surname || !formData.educationLevel || !formData.userType || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    await createUserAccount();
  };

  // Don't render if no user data
  if (!userData || !isNewUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* User Info */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Welcome, {userData.name}!</h3>
            <p className="text-gray-600">Let's complete your profile and set up your account</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">Step 1 of 1</span>
              <span className="text-sm text-gray-500">100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full"
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Single Step Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Set up your account with personal details and secure password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={userData.name} 
                    disabled 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Surname *</label>
                  <input 
                    type="text" 
                    value={formData.surname} 
                    onChange={(e) => setFormData(prev => ({ ...prev, surname: e.target.value }))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Your Surname"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level *</label>
                  <select 
                    value={formData.educationLevel} 
                    onChange={(e) => setFormData(prev => ({ ...prev, educationLevel: e.target.value }))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="High School">High School</option>
                    <option value="Bachelors">Bachelors</option>
                    <option value="Masters">Masters</option>
                    <option value="PhD">PhD</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">User Type *</label>
                  <select 
                    value={formData.userType} 
                    onChange={(e) => setFormData(prev => ({ ...prev, userType: e.target.value }))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select</option>
                    <option value="student">Student (looking for internship)</option>
                    <option value="professional">Working Professional (looking for jobs)</option>
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password} 
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center space-x-2">
                      {passwordValidation.minLength ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}`}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordValidation.hasUpperCase ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordValidation.hasLowerCase ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-red-600'}`}>One lowercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordValidation.hasNumbers ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${passwordValidation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>One number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {passwordValidation.hasSpecialChar ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-xs ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>One special character</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword} 
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))} 
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Match Indicator */}
                  {formData.confirmPassword && (
                    <div className="mt-2 flex items-center space-x-2">
                      {formData.password === formData.confirmPassword ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className={`text-xs ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || !formData.surname || !formData.educationLevel || !formData.userType || !formData.password || !formData.confirmPassword || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Complete Setup</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;