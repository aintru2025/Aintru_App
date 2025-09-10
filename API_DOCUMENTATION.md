# 📚 Aintru API Documentation

Complete API reference for the Aintru AI-Powered Interview Platform.

## 🌐 Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-backend-domain.com`

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📋 API Endpoints

### 🔑 Authentication Endpoints

#### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isVerified": false
  }
}
```

#### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isVerified": true
  }
}
```

#### POST `/api/auth/verify-credentials`
Verify user credentials before registration.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "isNewUser": true,
  "message": "Credentials verified"
}
```

#### GET `/api/auth/google`
Initiate Google OAuth flow.

**Response:** Redirects to Google OAuth page.

#### GET `/api/auth/github`
Initiate GitHub OAuth flow.

**Response:** Redirects to GitHub OAuth page.

#### POST `/api/auth/verify`
Verify email address.

**Request Body:**
```json
{
  "token": "verification_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 🎯 Interview Flow Endpoints

#### POST `/api/interviewFlow/generate-interview-flow`
Generate interview flow for job/internship preparation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "company": "Google",
  "role": "Software Engineer",
  "experience": "3 years",
  "expectedCTC": "15 LPA",
  "candidateProfileId": "profile_id"
}
```

**Response:**
```json
{
  "success": true,
  "interviewFlow": {
    "company": "Google",
    "role": "Software Engineer",
    "experienceLevel": "3 years",
    "expectedCTC": "15 LPA",
    "rounds": [
      {
        "round": 1,
        "name": "Technical Assessment",
        "type": "Technical",
        "duration": "45 mins",
        "questionType": "technical",
        "description": "Technical skills and problem-solving assessment"
      },
      {
        "round": 2,
        "name": "Behavioral Interview",
        "type": "Behavioral",
        "duration": "30 mins",
        "questionType": "behavioral",
        "description": "Behavioral and situational questions"
      }
    ],
    "totalDuration": 75,
    "difficulty": "Medium"
  },
  "message": "Interview flow generated successfully"
}
```

#### POST `/api/interviewFlow/generate-exam-flow`
Generate interview flow for exam preparation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "examName": "GATE",
  "examDescription": "Computer Science Engineering"
}
```

**Response:**
```json
{
  "success": true,
  "interviewFlow": {
    "examName": "GATE",
    "description": "Graduate Aptitude Test in Engineering preparation",
    "rounds": [
      {
        "round": 1,
        "name": "Technical Subject Assessment",
        "type": "Technical",
        "duration": "60 mins",
        "description": "Core engineering subject knowledge and problem-solving",
        "questionType": "technical",
        "focusAreas": ["Mathematics", "Engineering Mathematics", "Core Subject", "Problem Solving"]
      }
    ],
    "totalDuration": 105,
    "difficulty": "Hard",
    "preparationTips": [
      "Master core engineering subjects thoroughly",
      "Practice previous year GATE papers",
      "Focus on time management during preparation"
    ]
  },
  "message": "Exam interview flow generated successfully"
}
```

#### POST `/api/interviewFlow/company-suggestions`
Get company suggestions based on search query.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "tech"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Google",
    "Microsoft",
    "Amazon",
    "Apple",
    "Meta",
    "Netflix",
    "Uber",
    "Airbnb"
  ]
}
```

#### POST `/api/interviewFlow/role-suggestions`
Get role suggestions based on search query.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "software"
}
```

**Response:**
```json
{
  "success": true,
  "suggestions": [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Data Scientist",
    "Product Manager",
    "DevOps Engineer"
  ]
}
```

### 📄 Resume Endpoints

#### POST `/api/resume/upload`
Upload resume file.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: <resume_file>
```

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeId": "resume_id",
  "filename": "resume.pdf",
  "size": 1024000
}
```

#### POST `/api/resume/parse`
Parse resume content using AI.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "resumeId": "resume_id"
}
```

**Response:**
```json
{
  "success": true,
  "parsedData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "experience": "3 years",
    "skills": ["JavaScript", "React", "Node.js"],
    "education": "BS Computer Science",
    "summary": "Experienced software engineer..."
  },
  "atsScore": 85
}
```

#### GET `/api/resume/:id`
Get resume data by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "resume": {
    "id": "resume_id",
    "filename": "resume.pdf",
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "parsedData": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "experience": "3 years",
      "skills": ["JavaScript", "React", "Node.js"],
      "education": "BS Computer Science",
      "summary": "Experienced software engineer..."
    },
    "atsScore": 85
  }
}
```

#### PUT `/api/resume/:id`
Update resume data.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "parsedData": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "experience": "3 years",
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "education": "BS Computer Science",
    "summary": "Experienced software engineer with expertise in full-stack development..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume updated successfully",
  "atsScore": 90
}
```

### 📊 Analytics Endpoints

#### GET `/api/analytics/dashboard`
Get dashboard analytics data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalInterviews": 15,
    "averageScore": 78,
    "successRate": 85,
    "totalTime": 450,
    "performanceData": [
      {
        "date": "2024-01-01",
        "score": 75,
        "interviews": 2
      },
      {
        "date": "2024-01-02",
        "score": 80,
        "interviews": 3
      }
    ],
    "strengths": ["Technical Skills", "Problem Solving"],
    "improvements": ["Communication", "Time Management"]
  }
}
```

#### GET `/api/analytics/performance`
Get detailed performance metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `period`: `week`, `month`, `year` (optional, default: `month`)

**Response:**
```json
{
  "success": true,
  "performance": {
    "period": "month",
    "totalSessions": 25,
    "averageScore": 78,
    "bestScore": 95,
    "improvement": 12,
    "categoryScores": {
      "technical": 85,
      "behavioral": 70,
      "communication": 75,
      "problemSolving": 80
    },
    "trends": [
      {
        "date": "2024-01-01",
        "score": 75
      }
    ]
  }
}
```

#### POST `/api/analytics/session`
Record interview session data.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session_id",
  "score": 85,
  "duration": 45,
  "categoryScores": {
    "technical": 90,
    "behavioral": 80,
    "communication": 85,
    "problemSolving": 85
  },
  "feedback": "Great performance in technical questions...",
  "improvements": ["Work on time management", "Practice more behavioral questions"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Session recorded successfully"
}
```

### 🎯 Interview Endpoints

#### POST `/api/interview/start`
Start a new interview session.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "interviewFlowId": "flow_id",
  "mode": "voice",
  "candidateProfileId": "profile_id"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_id",
  "interview": {
    "id": "interview_id",
    "flow": {
      "company": "Google",
      "role": "Software Engineer",
      "rounds": [...]
    },
    "currentRound": 1,
    "questions": [
      {
        "id": "question_id",
        "text": "Tell me about yourself",
        "type": "behavioral",
        "timeLimit": 300
      }
    ]
  }
}
```

#### POST `/api/interview/submit-answer`
Submit answer for current question.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session_id",
  "questionId": "question_id",
  "answer": "I am a software engineer with 3 years of experience...",
  "audioUrl": "https://storage.example.com/audio.mp3",
  "videoUrl": "https://storage.example.com/video.mp4"
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "score": 8,
    "feedback": "Good answer, but could be more specific about your achievements",
    "suggestions": ["Add quantifiable results", "Be more concise"]
  },
  "nextQuestion": {
    "id": "next_question_id",
    "text": "What is your greatest weakness?",
    "type": "behavioral",
    "timeLimit": 300
  }
}
```

#### POST `/api/interview/complete`
Complete interview session.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": "session_id"
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "overallScore": 85,
    "categoryScores": {
      "technical": 90,
      "behavioral": 80,
      "communication": 85,
      "problemSolving": 85
    },
    "feedback": "Excellent performance overall...",
    "improvements": ["Work on time management", "Practice more behavioral questions"],
    "recommendations": ["Apply to senior positions", "Focus on leadership skills"]
  }
}
```

### 🏠 Dashboard Endpoints

#### GET `/api/dashboard/stats`
Get dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalInterviews": 15,
    "averageScore": 78,
    "successRate": 85,
    "totalTime": 450,
    "recentActivity": [
      {
        "type": "interview",
        "description": "Completed Google Software Engineer interview",
        "score": 85,
        "date": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### 👥 User Endpoints

#### GET `/api/user/profile`
Get user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "isVerified": true,
    "profile": {
      "experience": "3 years",
      "skills": ["JavaScript", "React", "Node.js"],
      "education": "BS Computer Science",
      "location": "San Francisco, CA"
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT `/api/user/profile`
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1234567890",
  "profile": {
    "experience": "4 years",
    "skills": ["JavaScript", "React", "Node.js", "Python"],
    "education": "BS Computer Science",
    "location": "San Francisco, CA"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "profile": {
      "experience": "4 years",
      "skills": ["JavaScript", "React", "Node.js", "Python"],
      "education": "BS Computer Science",
      "location": "San Francisco, CA"
    }
  }
}
```

## 🔍 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "message": "Invalid input data",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden",
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Something went wrong"
}
```

## 📝 Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 10 requests per 15 minutes
- **File Upload**: 5 requests per 15 minutes

## 🔒 Security

- All endpoints use HTTPS in production
- JWT tokens expire after 2 hours
- Rate limiting is enforced
- Input validation on all endpoints
- CORS is configured for specific origins

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": object | array,
  "error": string (only on error),
  "timestamp": string (ISO 8601)
}
```

## 🧪 Testing

### Health Check
```bash
curl https://your-api-domain.com/health
```

### Authentication Test
```bash
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Interview Flow Test
```bash
curl -X POST https://your-api-domain.com/api/interviewFlow/generate-interview-flow \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"company":"Google","role":"Software Engineer","experience":"3 years"}'
```

---

**For more information, visit our [GitHub Repository](https://github.com/yourusername/aintru)**
