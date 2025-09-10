# OAuth Setup Guide for Aintru

This guide will help you set up Google and GitHub OAuth authentication for your Aintru application.

## Prerequisites

1. Node.js and npm installed
2. Backend server running on port 3000
3. Frontend server running on port 5173

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Session Configuration
SESSION_SECRET=your-session-secret-key-here

# Email Configuration (for email verification)
EMAIL_FROM=no-reply@aintru.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Environment
NODE_ENV=development
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: Aintru
   - Homepage URL: `http://localhost:5173`
   - Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Click "Register application"
5. Copy the Client ID and Client Secret to your `.env` file

## Installation

1. Install the new dependencies:
   ```bash
   cd backend
   npm install express-session
   ```

2. Restart your backend server:
   ```bash
   npm start
   ```

## Testing OAuth

1. Start both frontend and backend servers
2. Go to `http://localhost:5173/login` or `http://localhost:5173/signup`
3. Click on "Login with Google" or "Login with GitHub"
4. Complete the OAuth flow
5. You should be redirected to the dashboard upon successful authentication

## Features Implemented

- ✅ Google OAuth authentication
- ✅ GitHub OAuth authentication
- ✅ Automatic user creation for OAuth users
- ✅ JWT token generation for OAuth users
- ✅ Error handling for OAuth failures
- ✅ Loading states during OAuth process
- ✅ Redirect handling after OAuth completion

## Security Notes

- OAuth users are automatically verified (no email verification required)
- JWT tokens are generated with 7-day expiration
- Session cookies are configured for security
- CORS is properly configured for local development

## Troubleshooting

1. **OAuth redirect errors**: Make sure your redirect URIs match exactly
2. **CORS errors**: Ensure your frontend is running on port 5173
3. **Session errors**: Check that SESSION_SECRET is set in your .env file
4. **JWT errors**: Verify JWT_SECRET is properly configured 