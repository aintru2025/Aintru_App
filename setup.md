# 🚀 Aintru Setup Guide

This guide will help you set up the Aintru AI-Powered Interview Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (version 8.0.0 or higher) - Comes with Node.js
- **Git** - [Download here](https://git-scm.com/)
- **MongoDB Atlas account** (free) - [Sign up here](https://www.mongodb.com/cloud/atlas)

## 🔧 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/aintru.git
cd aintru
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Dependencies
```bash
npm install
```

#### 2.3 Create Environment File
Create a `.env` file in the `backend` directory:

```bash
# On Windows
copy .env.example .env

# On macOS/Linux
cp .env.example .env
```

#### 2.4 Configure Environment Variables
Edit the `.env` file with your actual values:

```env
# Database (Required)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aintru?retryWrites=true&w=majority

# Authentication (Required)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
SESSION_SECRET=your_session_secret_here_make_it_different_from_jwt_secret

# AI Services (Optional - app works without these)
OPENAI_API_KEY=sk-your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Email (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Server
PORT=3000
NODE_ENV=development
```

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend
```

#### 3.2 Install Dependencies
```bash
npm install
```

### 4. Database Setup

#### 4.1 Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (choose the free tier)

#### 4.2 Configure Database Access
1. Go to "Database Access" in your Atlas dashboard
2. Click "Add New Database User"
3. Create a username and password
4. Give the user "Read and write to any database" permissions

#### 4.3 Configure Network Access
1. Go to "Network Access" in your Atlas dashboard
2. Click "Add IP Address"
3. For development, you can add "0.0.0.0/0" to allow access from anywhere
4. For production, add only your specific IP addresses

#### 4.4 Get Connection String
1. Go to "Clusters" in your Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Add this to your `.env` file as `MONGO_URI`

### 5. Start the Application

#### 5.1 Start Backend Server
```bash
cd backend
npm start
```

You should see:
```
🚀 Aintru Backend Server running on port 3000
🌍 Environment: development
📊 Database: Connected
🤖 AI Services: OpenAI ✅
🎤 Speech: Deepgram ✅
```

#### 5.2 Start Frontend Development Server
Open a new terminal:
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v5.4.2  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Access the Application

Open your browser and go to: **http://localhost:5173**

## 🎯 Quick Test

1. **Sign Up**: Create a new account
2. **Complete Profile**: Fill in your details
3. **Start Mock Interview**: Try the interview flow
4. **Build Resume**: Test the resume builder
5. **View Analytics**: Check the dashboard

## 🔧 Troubleshooting

### Common Issues

#### Backend Won't Start
- Check if port 3000 is available
- Verify MongoDB connection string
- Check if all required environment variables are set

#### Frontend Won't Start
- Check if port 5173 is available
- Verify all dependencies are installed
- Check for TypeScript errors

#### Database Connection Error
- Verify MongoDB Atlas cluster is running
- Check if your IP is whitelisted
- Verify username and password are correct

#### AI Services Not Working
- Check if API keys are correctly set
- Verify API key permissions
- Check console for specific error messages

### Getting Help

1. Check the console for error messages
2. Review the README.md file
3. Check the API documentation
4. Open an issue on GitHub

## 🚀 Next Steps

Once everything is running:

1. **Customize the UI**: Modify the frontend components
2. **Add Features**: Implement new functionality
3. **Deploy**: Deploy to production
4. **Contribute**: Submit pull requests

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs)
- [Node.js Documentation](https://nodejs.org/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

**Happy Coding! 🎉**
