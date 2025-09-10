const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Interview = require('../models/interview');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// GET /api/dashboard/data - Get all dashboard data for the user
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT token
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's interviews
    const interviews = await Interview.find({ userId }).sort({ createdAt: -1 });
    
    // Calculate stats
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const averageScore = completedInterviews.length > 0 
      ? Math.round(completedInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / completedInterviews.length)
      : 0;
    
    // Get recent interviews (last 5)
    const recentInterviews = completedInterviews.slice(0, 5).map(interview => ({
      company: interview.company,
      role: interview.role,
      score: interview.overallScore || 0,
      date: interview.createdAt.toISOString().split('T')[0]
    }));

    // Calculate performance trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyScores = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(month.getMonth() - i);
      const monthInterviews = completedInterviews.filter(interview => 
        interview.createdAt.getMonth() === month.getMonth() &&
        interview.createdAt.getFullYear() === month.getFullYear()
      );
      const monthScore = monthInterviews.length > 0 
        ? Math.round(monthInterviews.reduce((sum, i) => sum + (i.overallScore || 0), 0) / monthInterviews.length)
        : 0;
      monthlyScores.push({
        date: month.toLocaleDateString('en-US', { month: 'short' }),
        score: monthScore
      });
    }

    const dashboardData = {
      user: {
        name: user.name || user.username || user.email,
        email: user.email,
        avatar: user.avatar
      },
      stats: {
        totalInterviews,
        averageScore,
        improvement: 0, // TODO: Calculate based on previous performance
        hoursPracticed: Math.round(completedInterviews.length * 0.5) // Rough estimate
      },
      recentInterviews,
      performanceData: monthlyScores,
      isFirstTime: totalInterviews === 0
    };

    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

module.exports = router; 