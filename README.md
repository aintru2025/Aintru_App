# 🚀 Aintru - AI-Powered Interview Platform

<div align="center">

![Aintru Logo](frontend/src/assets/aintru-logo.png)

**A comprehensive full-stack platform for AI-powered mock interviews, resume building, and career development**

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0.0-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/cloud/atlas)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-blue.svg)](https://tailwindcss.com/)

</div>

---

## ✨ Features

### 🎯 **AI-Powered Mock Interviews**
- **Voice & Video Interviews**: Practice with realistic AI interviewers
- **Exam Preparation**: Specialized flows for GATE, CAT, UPSC, GRE, TOEFL, and more
- **Job/Internship Interviews**: Company-specific interview flows with role suggestions
- **Real-time Feedback**: Instant scoring and detailed performance analysis
- **Smart Question Generation**: AI-powered questions based on your profile and target role

### 📄 **ATS-Optimized Resume Builder**
- **AI-Powered Suggestions**: Get recommendations for better ATS compatibility
- **Multiple Templates**: Modern, Classic, Creative, and Tech-focused designs
- **Real-time Optimization**: Live ATS scoring and improvement tips
- **PDF Export**: Download professional resumes instantly

### 📊 **Analytics & Progress Tracking**
- **Performance Dashboard**: Track your interview improvement over time
- **Detailed Analytics**: Comprehensive insights into your strengths and areas for improvement
- **Progress Visualization**: Beautiful charts and graphs showing your growth

### 🔐 **Authentication & Security**
- **Multiple Login Options**: Email/Password, Google OAuth, GitHub OAuth
- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Complete email verification flow
- **Session Management**: 2-hour session timeout for security

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion powered animations
- **Dark/Light Theme**: Beautiful gradient designs
- **Accessibility**: WCAG compliant interface

---

## 🛠️ Tech Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS 3.4.1** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Router DOM 7.6.3** - Client-side routing
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icon library
- **React Hook Form** - Form handling and validation
- **React PDF** - PDF generation and viewing
- **React Webcam** - Camera integration for video interviews
- **React Speech Recognition** - Voice input handling

### **Backend**
- **Node.js 18.0.0+** - JavaScript runtime
- **Express.js 5.1.0** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose 8.16.4** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Passport.js** - Authentication middleware
- **Nodemailer** - Email sending
- **Express File Upload** - File handling
- **Bcryptjs** - Password hashing

### **AI Services**
- **OpenAI GPT-4o** - Interview questions and feedback generation
- **Deepgram** - Voice-to-text transcription
- **ElevenLabs** - Text-to-speech for AI interviewer
- **MediaPipe** - Video analysis and emotion detection

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- MongoDB Atlas account (free tier available)
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/aintru.git
cd aintru
```

### **2. Environment Setup**

#### **Backend Environment**
Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
```

**Required Environment Variables:**
```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aintru?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# Session Secret
SESSION_SECRET=your_session_secret_here

# AI Services (Optional - app works without these)
OPENAI_API_KEY=your_openai_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=3000
NODE_ENV=development
```

#### **Frontend Environment**
The frontend doesn't require environment variables as it uses the backend API.

### **3. Install Dependencies**

#### **Backend**
```bash
cd backend
npm install
```

#### **Frontend**
```bash
cd frontend
npm install
```

### **4. Start the Application**

#### **Start Backend Server**
```bash
cd backend
npm start
# or for development
npm run dev
```

#### **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```

### **5. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 📁 Project Structure

```
aintru/
├── 📁 backend/                    # Backend API server
│   ├── 📁 config/                 # Configuration files
│   │   ├── ai.js                 # AI services configuration
│   │   ├── passport.js           # OAuth configuration
│   │   └── production.js         # Production settings
│   ├── 📁 models/                # Database models
│   │   ├── user.js              # User model
│   │   ├── interview.js          # Interview model
│   │   ├── resume.js             # Resume model
│   │   ├── analytics.js          # Analytics model
│   │   └── ...
│   ├── 📁 routes/                # API routes
│   │   ├── auth.js               # Authentication routes
│   │   ├── interview.js          # Interview routes
│   │   ├── interviewFlow.js      # Interview flow generation
│   │   ├── resume.js             # Resume routes
│   │   ├── analytics.js          # Analytics routes
│   │   └── ...
│   ├── 📄 index.js               # Main server file
│   ├── 📄 start.js               # Production start file
│   ├── 📄 package.json           # Backend dependencies
│   └── 📄 .env.example           # Environment variables template
│
├── 📁 frontend/                   # React frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   │   ├── Navigation.tsx    # Main navigation
│   │   │   ├── InterviewFlowSetup.tsx  # Interview setup
│   │   │   ├── InterviewExecution.tsx  # Interview execution
│   │   │   ├── ResumeParser.tsx  # Resume parsing
│   │   │   └── ...
│   │   ├── 📁 pages/             # Main application pages
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── MockInterview.tsx # Mock interview page
│   │   │   ├── ResumeBuilder.tsx # Resume builder page
│   │   │   ├── Analytics.tsx     # Analytics page
│   │   │   └── ...
│   │   ├── 📁 stores/            # State management
│   │   │   └── authStore.ts      # Authentication store
│   │   ├── 📁 config/            # Configuration
│   │   │   └── InterviewRoundsConfig.ts
│   │   ├── 📁 assets/            # Static assets
│   │   │   └── aintru-logo.png
│   │   ├── 📄 App.tsx            # Main app component
│   │   └── 📄 main.tsx           # Entry point
│   ├── 📄 package.json           # Frontend dependencies
│   ├── 📄 vite.config.ts         # Vite configuration
│   └── 📄 tailwind.config.js     # TailwindCSS configuration
│
└── 📄 README.md                  # This file
```

---

## 🔧 Configuration

### **Database Setup**
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### **AI Services Setup (Optional)**
The application works without AI services, but they enhance the experience:

#### **OpenAI Setup**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Add it to your `.env` file

#### **Deepgram Setup**
1. Go to https://console.deepgram.com/
2. Create a new API key
3. Add it to your `.env` file

#### **ElevenLabs Setup**
1. Go to https://elevenlabs.io/
2. Create an account and get your API key
3. Add it to your `.env` file

### **OAuth Setup (Optional)**
#### **Google OAuth**
1. Go to https://console.developers.google.com/
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add client ID and secret to `.env`

#### **GitHub OAuth**
1. Go to https://github.com/settings/developers
2. Create a new OAuth App
3. Add client ID and secret to `.env`

---

## 🎯 Usage Guide

### **Getting Started**
1. **Sign Up**: Create an account using email/password or OAuth
2. **Complete Profile**: Fill in your personal and professional details
3. **Choose Interview Type**: Select between exam preparation or job/internship interviews

### **Mock Interviews**
1. **Exam Preparation**:
   - Enter exam name (GATE, CAT, UPSC, GRE, etc.)
   - Add optional description
   - Get AI-generated interview flow

2. **Job/Internship Interviews**:
   - Upload your resume
   - Enter experience level and expected CTC
   - Select company and role
   - Get personalized interview flow

3. **Interview Modes**:
   - **Voice Mode**: Practice with voice-only interviews
   - **Video Mode**: Full video interviews with AI interviewer

### **Resume Builder**
1. **Personal Information**: Add your contact details
2. **Professional Summary**: Write a compelling summary
3. **Work Experience**: Add your work history
4. **Education**: Add your educational background
5. **Skills**: List your technical and soft skills
6. **Optimization**: Get AI-powered suggestions for ATS optimization
7. **Export**: Download as PDF

### **Analytics Dashboard**
- View your interview performance over time
- Track improvement in different areas
- See detailed feedback and recommendations

---

## 🔌 API Endpoints

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-credentials` - Verify user credentials
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/github` - GitHub OAuth
- `POST /api/auth/verify` - Email verification

### **Interview Flow**
- `POST /api/interviewFlow/generate-interview-flow` - Generate job interview flow
- `POST /api/interviewFlow/generate-exam-flow` - Generate exam interview flow
- `POST /api/interviewFlow/company-suggestions` - Get company suggestions
- `POST /api/interviewFlow/role-suggestions` - Get role suggestions

### **Resume**
- `POST /api/resume/upload` - Upload resume
- `POST /api/resume/parse` - Parse resume content
- `GET /api/resume/:id` - Get resume data
- `PUT /api/resume/:id` - Update resume

### **Analytics**
- `GET /api/analytics/dashboard` - Get dashboard data
- `GET /api/analytics/performance` - Get performance metrics
- `POST /api/analytics/session` - Record interview session

---

## 🧪 Testing

### **Backend Testing**
```bash
cd backend
npm test
```

### **Frontend Testing**
```bash
cd frontend
npm run test
```

### **Manual Testing**
1. Test user registration and login
2. Test OAuth flows
3. Test interview flow generation
4. Test resume upload and parsing
5. Test mock interview execution

---

## 🚀 Deployment

### **Backend Deployment (Railway/Heroku)**
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

### **Frontend Deployment (Vercel/Netlify)**
1. Connect your GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy automatically

### **Environment Variables for Production**
Make sure to set all required environment variables in your deployment platform.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Troubleshooting

### **Common Issues**

#### **MongoDB Connection Error**
- Check your MongoDB Atlas connection string
- Ensure your IP is whitelisted
- Verify database user credentials

#### **AI Services Not Working**
- Check if API keys are correctly set in `.env`
- Verify API key permissions and quotas
- Check console for specific error messages

#### **OAuth Not Working**
- Verify OAuth app configuration
- Check redirect URIs
- Ensure client ID and secret are correct

#### **File Upload Issues**
- Check file size limits
- Verify file type restrictions
- Ensure proper permissions

### **Getting Help**
- Check the console for error messages
- Review the API documentation
- Open an issue on GitHub

---

## 🎉 Acknowledgments

- **OpenAI** for GPT-4 API
- **Deepgram** for voice-to-text services
- **ElevenLabs** for text-to-speech
- **MongoDB** for database services
- **React** and **Node.js** communities

---

<div align="center">

**Built with ❤️ by the Aintru Team**

[🌟 Star this repo](https://github.com/yourusername/aintru) | [🐛 Report Bug](https://github.com/yourusername/aintru/issues) | [💡 Request Feature](https://github.com/yourusername/aintru/issues)

</div>