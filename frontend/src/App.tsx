import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';
import GetStartedPage from './pages/GetStartedPage';
import Onboarding from './pages/Onboarding';
import MockInterview from './pages/MockInterview';
import ResumeBuilder from './pages/ResumeBuilder';
import Settings from './pages/Settings';
import Navigation from './components/Navigation';
import { useAuthStore } from './stores/authStore';
import SignUpPage from './pages/SignUpPage';
import VerifyPage from './pages/VerifyPage';
import OAuthSuccess from './pages/OAuthSuccess';
import Analytics from './pages/Analytics';
import JobMatches from './pages/JobMatches';
import Profile from './pages/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, getToken } = useAuthStore();
  const token = getToken();

  if (!isAuthenticated || !token) {
    console.log('🚫 Access denied - redirecting to login');
    return <Navigate to="/login" replace state={{ message: 'Please login to access this page' }} />;
  }
  return <>{children}</>;
}

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      await initializeAuth();
      setIsInitialized(true);
    };
    initAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full max-w-full">
        <Navigation />
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-full overflow-x-hidden"
        >
          <Routes>
            {/* Get Started is the default entry point */}
            <Route path="/" element={<GetStartedPage />} />
            
            {/* Auth routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/verify" element={<VerifyPage />} />
            
            {/* Protected app routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mock-interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/job-matches" element={<ProtectedRoute><JobMatches /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Catch all - redirect to get started */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </div>
    </Router>
  );
}

export default App;