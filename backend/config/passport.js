const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.email); // Use email as the unique identifier
});

// Deserialize user from session
passport.deserializeUser(async (email, done) => {
  try {
    const user = await User.findOne({ email });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('GoogleStrategy callback hit. Profile:', profile);
  try {
    console.log('Looking for existing user with provider: google, providerId:', profile.id);
    let user = await User.findOne({ provider: 'google', providerId: profile.id });
    
    if (!user) {
      console.log('No existing user found, creating new user...');
      user = await User.create({
        email: profile.emails[0].value,
        name: profile.displayName,
        provider: 'google',
        providerId: profile.id,
        isVerified: true,
        avatar: profile.photos[0]?.value
      });
      console.log('New user created successfully:', user._id);
    } else {
      console.log('Existing user found:', user._id);
    }
    
    console.log('Returning user to passport:', user._id);
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  console.log('GitHubStrategy callback hit. Profile:', profile);
  try {
    let email = (profile.emails && profile.emails[0] && profile.emails[0].value)
      ? profile.emails[0].value
      : `${profile.username || profile.id}@github.com`;

    let user = await User.findOne({ provider: 'github', providerId: profile.id });
    if (!user) {
      user = await User.create({
        email,
        name: profile.displayName || profile.username || 'GitHub User',
        provider: 'github',
        providerId: profile.id,
        isVerified: true,
        avatar: (profile.photos && profile.photos[0] && profile.photos[0].value) || undefined
      });
    }
    return done(null, user);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

module.exports = passport; 