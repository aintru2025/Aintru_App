import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import logo from '../assets/aintru-logo.png';

const OAuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle OAuth error
      navigate('/login?error=oauth_failed');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      // Fetch user profile with token and update Zustand store
      fetch('http://localhost:3000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((user) => {
          login(user);
          navigate('/dashboard');
        })
        .catch(() => {
          navigate('/login?error=oauth_failed');
        });
    } else {
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <img src={logo} alt="Aintru Logo" className="h-16 w-auto mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Completing Authentication...</h2>
        <p className="text-gray-600">Please wait while we log you in.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-enteru-600 mx-auto"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess; 