import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    if (!token || !email) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }
    fetch(`http://localhost:3000/api/auth/verify?token=${token}&email=${encodeURIComponent(email)}`)
      .then(res => {
        if (!res.ok) throw new Error('Verification failed');
        return res.text();
      })
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified! You can now log in.');
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed or link expired.');
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        <div className={status === 'success' ? 'text-green-600' : status === 'error' ? 'text-red-500' : 'text-gray-600'}>
          {message}
        </div>
        {status === 'success' && (
          <Link to="/login" className="mt-6 inline-block text-enteru-600 font-semibold hover:underline">Go to Login</Link>
        )}
      </div>
    </div>
  );
};

export default VerifyPage; 