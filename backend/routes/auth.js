const express = require('express');
const router = express.Router();
const User = require('../models/user');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Test route to verify router is working
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth router is working!' });
});

// Helper: create Nodemailer transporter (disabled)
/* Email delivery disabled for onboarding flow
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
*/

// Session timeout validation middleware
function validateSession(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.userId;
    
    // Check session timeout
    const now = Date.now();
    const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
    const sessionTimeout = 2 * 60 * 60 * 1000; // 2 hours
    
    if (now - tokenIssuedAt > sessionTimeout) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED'
      });
    }
    
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Session expired. Please login again.',
        code: 'SESSION_EXPIRED'
      });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
}

// JWT auth middleware (legacy, use validateSession instead)
function authenticateJWT(req, res, next) {
  return validateSession(req, res, next);
}

// POST /api/auth/verify-credentials
router.post('/verify-credentials', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!email || !phone || !name) {
      return res.status(400).json({ success: false, error: 'Name, email and phone are required.' });
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }
    
    // Check if user exists in waitlists collection
    const Waitlist = require('../models/waitlist');
    const waitlistUser = await Waitlist.findOne({ email });
    
    if (!waitlistUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email not found in waitlist. Please join our waitlist first.' 
      });
    }
    
    // Check if phone matches
    if (waitlistUser.phone !== phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Phone number does not match our records.' 
      });
    }
    
    // Check if user already exists in users collection
    const existingUser = await User.findOne({ $or: [ { email }, { phone } ] });
    
    if (existingUser) {
      return res.json({ 
        success: true, 
        isNewUser: false,
        message: 'Account already exists. Please login instead.'
      });
    }
    
    // Credentials are valid and user doesn't exist - proceed to profile creation
    res.json({ 
      success: true, 
      isNewUser: true,
      message: 'Credentials verified from waitlist. Please complete your profile.',
      waitlistData: {
        name: waitlistUser.name,
        email: waitlistUser.email,
        phone: waitlistUser.phone
      }
    });
    
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { email, phone, name, password } = req.body;
    if (!email || !phone || !name || !password) {
      return res.status(400).json({ success: false, error: 'Email, phone, name and password are required.' });
    }
    
    // Validate phone format (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number format.' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
    }
    
    // Check for duplicate email or phone
    const existingUser = await User.findOne({ $or: [ { email }, { phone } ] });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email or phone already in use.' });
    }
    
    // Create user with password (password will be hashed by pre-save hook)
    const user = new User({ 
      email, 
      phone, 
      name, 
      password,
      userType: 'student', // Default userType to satisfy required field
      isVerified: true, // Waitlist users are pre-verified
      lastActivity: new Date()
    });
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      user: { 
        _id: user._id, 
        email: user.email, 
        name: user.name 
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/verify-email (disabled)
// router.get('/verify-email', async (req, res) => {
//   return res.status(404).send('Email verification is disabled for this flow.');
// });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check if password matches
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(401).json({ success: false, error: 'Please verify your email before logging in.' });
    }
    
    // Update last activity
    user.lastActivity = new Date();
    await user.save();
    
    // Generate JWT token with shorter expiry (2 hours)
    const token = jwt.sign(
      { 
        userId: user._id,
        iat: Math.floor(Date.now() / 1000) // Issue time
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '2h' }
    );
    
    // Success: return user info and token
    res.json({ 
      success: true, 
      user: { 
        _id: user._id, 
        email: user.email, 
        phone: user.phone, 
        name: user.name,
        lastActivity: user.lastActivity
      },
      token: token
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/logout
router.post('/logout', validateSession, async (req, res) => {
  try {
    // In a real implementation, you might want to add the token to a blacklist
    // For now, we'll just return success - the frontend will remove the token
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/refresh-session
router.post('/refresh-session', validateSession, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    
    // Update last activity
    user.lastActivity = new Date();
    await user.save();
    
    // Generate new token
    const newToken = jwt.sign(
      { 
        userId: user._id,
        iat: Math.floor(Date.now() / 1000)
      }, 
      process.env.JWT_SECRET || 'your_jwt_secret', 
      { expiresIn: '2h' }
    );
    
    res.json({ 
      success: true, 
      token: newToken,
      user: { 
        _id: user._id, 
        email: user.email, 
        phone: user.phone, 
        name: user.name,
        lastActivity: user.lastActivity
      }
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/auth/complete-profile (No JWT required - user is being created)
router.post('/complete-profile', async (req, res) => {
  try {
    const { 
      surname,
      educationLevel,
      userType,
      isStudent,
      email, // Add email to identify the user
      phone  // Add phone to identify the user
    } = req.body;
    
    // Find user by email and phone instead of JWT
    const user = await User.findOne({ email, phone });
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    
    // Update basic profile fields only
    if (surname) user.surname = surname;
    if (educationLevel) user.educationLevel = educationLevel;
    if (userType) user.userType = userType;
    if (typeof isStudent === 'boolean') user.isStudent = isStudent;
    
    user.lastActivity = new Date();
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /api/auth/me (JWT protected)
router.get('/me', validateSession, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-verificationToken');
    if (!user) return res.status(404).json({ success: false, error: 'User not found.' });
    
    // Update last activity
    user.lastActivity = new Date();
    await user.save();
    
    res.json(user);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('Google OAuth callback route hit');
      console.log('User in request:', req.user);
      
      if (!req.user) {
        console.log('No user found in request, redirecting to login');
        return res.redirect('http://localhost:5173/login?error=oauth_failed');
      }
      
      // Update last activity for OAuth users
      await User.findByIdAndUpdate(req.user._id, { lastActivity: new Date() });
      
      console.log('Generating JWT for user:', req.user._id);
      const token = jwt.sign(
        { 
          userId: req.user._id,
          iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET || 'your_jwt_secret', 
        { expiresIn: '2h' }
      );
      
      console.log('Redirecting to frontend with token');
      res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect('http://localhost:5173/login?error=oauth_failed');
    }
  }
);

// GitHub OAuth routes
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: 'http://localhost:5173/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      console.log('GitHub OAuth callback route hit');
      console.log('User in request:', req.user);
      
      if (!req.user) {
        console.log('No user found in request, redirecting to login');
        return res.redirect('http://localhost:5173/login?error=oauth_failed');
      }
      
      // Update last activity for OAuth users
      await User.findByIdAndUpdate(req.user._id, { lastActivity: new Date() });
      
      console.log('Generating JWT for user:', req.user._id);
      const token = jwt.sign(
        { 
          userId: req.user._id,
          iat: Math.floor(Date.now() / 1000)
        }, 
        process.env.JWT_SECRET || 'your_jwt_secret', 
        { expiresIn: '2h' }
      );
      
      console.log('Redirecting to frontend with token');
      res.redirect(`http://localhost:5173/oauth-success?token=${token}`);
    } catch (err) {
      console.error('OAuth callback error:', err);
      res.redirect('http://localhost:5173/login?error=oauth_failed');
    }
  }
);

// Token validation endpoint
router.get('/validate', validateSession, (req, res) => {
  res.json({ valid: true, user: { userId: req.userId } });
});

module.exports = router; 