import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const ProfileCompletion = () => {
  const { user, login } = useAuthStore();
  const [form, setForm] = useState({
    username: '',
    mobile: '',
    gender: '',
    institute: '',
    year: '',
    isStudent: true,
    currentCompany: '',
    currentPosition: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get JWT token from localStorage (or your auth flow)
  const token = localStorage.getItem('token');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Profile updated!');
        login(data.user); // update Zustand store
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-xl shadow mt-16">
      <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <input name="username" placeholder="Username" value={form.username} onChange={handleChange} className="input-field mb-3" required />
      <input name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} className="input-field mb-3" required />
      <select name="gender" value={form.gender} onChange={handleChange} className="input-field mb-3" required>
        <option value="">Select Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <label className="block mb-2">
        <input type="checkbox" name="isStudent" checked={form.isStudent} onChange={handleChange} className="mr-2" />
        I am a student
      </label>
      {form.isStudent ? (
        <>
          <input name="institute" placeholder="Institute Name" value={form.institute} onChange={handleChange} className="input-field mb-3" required />
          <input name="year" placeholder="Year" value={form.year} onChange={handleChange} className="input-field mb-3" required />
        </>
      ) : (
        <>
          <input name="currentCompany" placeholder="Current Company" value={form.currentCompany} onChange={handleChange} className="input-field mb-3" required />
          <input name="currentPosition" placeholder="Current Position" value={form.currentPosition} onChange={handleChange} className="input-field mb-3" required />
        </>
      )}
      <button type="submit" className="btn mt-4 w-full" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</button>
    </form>
  );
};

export default ProfileCompletion; 