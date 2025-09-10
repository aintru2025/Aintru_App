import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/aintru-logo.png';
import { useAuthStore } from '../stores/authStore';
import { Clock, Bell, Briefcase, TrendingUp, Lightbulb, X, User, Settings, Shield, CreditCard, LogOut, Clock3 } from 'lucide-react';

const appLinks = [
  { name: 'Dashboard', to: '/dashboard' },
  { name: 'Mock Interview', to: '/mock-interview' },
  { name: 'Resume Builder', to: '/resume-builder' },
  { name: 'Analytics', to: '/analytics' },
  { name: 'Job Matches', to: '/job-matches' },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'job',
      title: 'New Job Match Found!',
      message: 'Software Engineer position at Google matches your profile',
      time: '2 hours ago',
      read: false,
      icon: Briefcase
    },
    {
      id: 2,
      type: 'tip',
      title: 'Improvement Tip',
      message: 'Practice STAR method for behavioral questions',
      time: '1 day ago',
      read: false,
      icon: Lightbulb
    },
    {
      id: 3,
      type: 'progress',
      title: 'Great Progress!',
      message: 'Your interview confidence has improved by 15%',
      time: '2 days ago',
      read: true,
      icon: TrendingUp
    }
  ]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notification-dropdown') && !target.closest('.user-dropdown')) {
        setNotificationOpen(false);
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Session timeout management
  useEffect(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = decoded.exp - now;
        
        if (timeUntilExpiry > 0) {
          // Set warning 5 minutes before expiry
          const warningTime = Math.max(0, timeUntilExpiry - 300);
          const warningTimer = setTimeout(() => {
            setSessionWarning(true);
            setTimeLeft(warningTime);
          }, warningTime * 1000);
          
          // Countdown timer
          const countdownTimer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
          }, 1000);
          
          return () => {
            clearTimeout(warningTimer);
            clearInterval(countdownTimer);
          };
        } else {
          handleSessionExpiry();
        }
      } catch (err) {
        console.error('Token decode error:', err);
        handleSessionExpiry();
      }
    }
  }, [isAuthenticated]);

  const handleSessionExpiry = () => {
    logout();
    navigate('/login');
  };

  const refreshSession = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:3000/api/auth/refresh-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        setSessionWarning(false);
        setTimeLeft(0);
        // Refresh the page to update auth state
        window.location.reload();
      } else if (response.status === 401) {
        handleSessionExpiry();
      }
    } catch (err) {
      console.error('Session refresh failed:', err);
      handleSessionExpiry();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Notification functions
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <>
      {/* Session Warning Modal */}
      {sessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-yellow-500 mr-2" />
              <h3 className="text-lg font-semibold">Session Expiring Soon</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Your session will expire in <span className="font-bold text-red-600">{formatTime(timeLeft)}</span>
            </p>
            <div className="flex gap-3">
              <button 
                onClick={refreshSession}
                className="flex-1 bg-enteru-600 text-white px-4 py-2 rounded-lg hover:bg-enteru-700 transition-colors"
              >
                Extend Session
              </button>
              <button 
                onClick={handleSessionExpiry}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout Now
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Aintru Logo" className="h-14 w-auto" />
              <span className="text-2xl font-bold bg-gradient-to-r from-enteru-600 to-enteru-800 bg-clip-text text-transparent">
                Aintru
              </span>
            </div>
            
            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-8">
                  {appLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-1 text-base text-gray-700 hover:text-enteru-600 transition-colors font-medium`}
                      style={{ fontWeight: location.pathname === link.to ? 'bold' : 'normal' }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                
                <div className="relative flex items-center ml-4 space-x-4">
                  {/* Notification Bell */}
                  <div className="relative notification-dropdown">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative"
                      onClick={() => setNotificationOpen(!notificationOpen)}
                    >
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {notificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50 max-h-96 overflow-y-auto">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                              <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                Mark all as read
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="max-h-64 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    notification.type === 'job' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'tip' ? 'bg-yellow-100 text-yellow-600' :
                                    'bg-blue-100 text-blue-600'
                                  }`}>
                                    <notification.icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${
                                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {notification.title}
                                      </p>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeNotification(notification.id);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        
                        {notifications.length > 0 && (
                          <div className="p-3 border-t border-gray-100">
                            <button
                              onClick={() => navigate('/notifications')}
                              className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
                            >
                              View all notifications
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className="relative user-dropdown">
                    <button
                      className="flex items-center space-x-2 focus:outline-none"
                      onClick={() => setDropdownOpen((v) => !v)}
                    >
                    {user?.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-9 h-9 rounded-full border-2 border-enteru-500" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-enteru-500 to-enteru-700 flex items-center justify-center text-white font-bold text-lg">
                        {user?.name ? user.name[0] : user?.email[0]}
                      </div>
                    )}
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-enteru-500" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-enteru-500 to-enteru-700 flex items-center justify-center text-white font-bold text-lg">
                              {user?.name ? user.name[0] : user?.email[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" 
                          onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                        >
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </button>
                        
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" 
                          onClick={() => { navigate('/settings'); setDropdownOpen(false); }}
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </button>
                        
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" 
                          onClick={() => { navigate('/privacy'); setDropdownOpen(false); }}
                        >
                          <Shield className="w-4 h-4 mr-3" />
                          Privacy & Security
                        </button>
                        
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" 
                          onClick={() => { navigate('/billing'); setDropdownOpen(false); }}
                        >
                          <CreditCard className="w-4 h-4 mr-3" />
                          Billing & Plans
                        </button>
                      </div>

                      {/* Session Management */}
                      <div className="border-t border-gray-100 py-2">
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-enteru-600 hover:bg-gray-50 transition-colors" 
                          onClick={() => { refreshSession(); setDropdownOpen(false); }}
                        >
                          <Clock3 className="w-4 h-4 mr-3" />
                          Extend Session
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-2">
                        <button 
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors" 
                          onClick={() => { logout(); setDropdownOpen(false); }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                {/* No navigation links for non-authenticated users */}
                <div className="text-gray-500 text-sm">
                  AI Interview Preparation Platform
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;