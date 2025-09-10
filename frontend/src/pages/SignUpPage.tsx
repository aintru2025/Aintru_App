import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Github, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/aintru-logo.png';
import { useAuthStore } from '../stores/authStore';

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_17_40)">
      <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.6C36.9 32.2 34.8 34.7 31.9 36.3V42.1H39.5C44 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
      <path d="M24 48C30.6 48 36.1 45.9 39.5 42.1L31.9 36.3C30.1 37.5 27.8 38.3 24 38.3C17.7 38.3 12.2 34.2 10.3 28.7H2.4V34.7C5.8 41.1 14.1 48 24 48Z" fill="#34A853"/>
      <path d="M10.3 28.7C9.8 27.5 9.5 26.2 9.5 24.8C9.5 23.4 9.8 22.1 10.3 20.9V14.9H2.4C0.8 18.1 0 21.4 0 24.8C0 28.2 0.8 31.5 2.4 34.7L10.3 28.7Z" fill="#FBBC05"/>
      <path d="M24 9.7C27.7 9.7 30.5 11 32.3 12.7L39.6 5.4C36.1 2.1 30.6 0 24 0C14.1 0 5.8 6.9 2.4 14.9L10.3 20.9C12.2 15.4 17.7 9.7 24 9.7Z" fill="#EA4335"/>
    </g>
    <defs>
      <clipPath id="clip0_17_40">
        <rect width="48" height="48" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [oauthLoading, setOauthLoading] = useState('');
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for OAuth error messages
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'oauth_failed') {
      setError('OAuth authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 409) {
          throw new Error('An account with this email or phone already exists. Please log in or use different credentials.');
        } else if (res.status === 400) {
          throw new Error(data.error || 'Please check your input and try again.');
        } else {
          throw new Error(data.error || 'Signup failed. Please try again.');
        }
      }
      
      setSuccess(data.message || 'Signup successful. Please check your email to verify your account.');
      // Do NOT log in or redirect to dashboard here
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setOauthLoading('google');
    setError('');
    window.location.href = 'http://localhost:3000/api/auth/google';
  };

  const handleGitHubAuth = () => {
    setOauthLoading('github');
    setError('');
    window.location.href = 'http://localhost:3000/api/auth/github';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 relative">
      {/* Back arrow */}
      <Link to="/login" className="absolute left-8 top-8 flex items-center text-gray-500 hover:text-enteru-600 transition-colors">
        <ArrowLeft className="w-6 h-6 mr-1" />
        <span className="font-medium">Back</span>
      </Link>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Aintru Logo" className="h-14 w-auto mb-2" />
          <span className="text-3xl font-bold bg-gradient-to-r from-enteru-600 to-enteru-800 bg-clip-text text-transparent">Aintru</span>
        </div>
        
        <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
        
        {success ? (
          <div className="text-green-600 text-center mb-4">{success}</div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Your Name" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Email</label>
              <input 
                type="email" 
                className="input-field" 
                placeholder="you@email.com" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Phone Number</label>
              <input 
                type="tel" 
                className="input-field" 
                placeholder="+1 (555) 123-4567" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
              <p className="text-sm text-gray-500 mt-1">
                Your phone number will act as your password for login
              </p>
            </div>
            
            {error && <div className="text-red-500 text-sm">{error}</div>}
            
            <Button type="submit" className="w-full text-base font-semibold" loading={loading}>
              Get Started
            </Button>
          </form>
        )}
        
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-gray-200" />
          <span className="mx-4 text-gray-400 font-medium">or</span>
          <div className="flex-grow h-px bg-gray-200" />
        </div>
        
        <div className="flex flex-col gap-4 mb-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-base font-medium border-gray-300 hover:bg-gray-50"
            onClick={handleGoogleAuth}
            loading={oauthLoading === 'google'}
            disabled={oauthLoading !== ''}
          >
            <span className="flex items-center justify-center w-full">
              <GoogleIcon /> 
              {oauthLoading === 'google' ? 'Connecting...' : 'Sign up with Google'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            className="w-full flex items-center justify-center text-base font-medium border-gray-300 hover:bg-gray-50"
            onClick={handleGitHubAuth}
            loading={oauthLoading === 'github'}
            disabled={oauthLoading !== ''}
          >
            <span className="flex items-center justify-center w-full">
              <Github className="w-5 h-5 mr-2" /> 
              {oauthLoading === 'github' ? 'Connecting...' : 'Sign up with GitHub'}
            </span>
          </Button>
        </div>
        
        <div className="mt-6 text-center text-gray-600">
          Already have an account? <Link to="/login" className="text-enteru-600 font-semibold hover:underline">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 