# 🚀 Aintru Deployment Guide

This guide covers deploying the Aintru AI-Powered Interview Platform to various cloud platforms.

## 📋 Prerequisites

- GitHub repository with your code
- Cloud platform account (Railway, Heroku, Vercel, etc.)
- MongoDB Atlas cluster
- Domain name (optional)

## 🌐 Deployment Options

### Option 1: Railway (Recommended)

Railway provides easy deployment for both frontend and backend.

#### Backend Deployment

1. **Connect Repository**
   - Go to [Railway](https://railway.app/)
   - Sign up with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Backend**
   - Select the `backend` folder
   - Set the root directory to `backend`
   - Add environment variables in the dashboard

3. **Environment Variables**
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   OPENAI_API_KEY=your_openai_key
   DEEPGRAM_API_KEY=your_deepgram_key
   ELEVENLABS_API_KEY=your_elevenlabs_key
   NODE_ENV=production
   ```

4. **Deploy**
   - Railway will automatically deploy
   - Get your backend URL (e.g., `https://your-app.railway.app`)

#### Frontend Deployment

1. **Create New Service**
   - In the same Railway project
   - Click "New Service"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Frontend**
   - Select the `frontend` folder
   - Set the root directory to `frontend`
   - Set build command: `npm run build`
   - Set start command: `npm run preview`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

4. **Deploy**
   - Railway will build and deploy your frontend
   - Get your frontend URL

### Option 2: Heroku

#### Backend Deployment

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku**
   ```bash
   heroku login
   ```

3. **Create Heroku App**
   ```bash
   cd backend
   heroku create your-app-name-backend
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set MONGO_URI=your_mongodb_connection_string
   heroku config:set JWT_SECRET=your_jwt_secret
   heroku config:set SESSION_SECRET=your_session_secret
   heroku config:set OPENAI_API_KEY=your_openai_key
   heroku config:set NODE_ENV=production
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy backend"
   git push heroku main
   ```

#### Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com/)
   - Sign up with GitHub
   - Import your repository

2. **Configure Build Settings**
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   ```
   VITE_API_URL=https://your-backend-url.herokuapp.com
   ```

4. **Deploy**
   - Vercel will automatically deploy
   - Get your frontend URL

### Option 3: DigitalOcean App Platform

#### Backend Deployment

1. **Create App**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect your GitHub repository

2. **Configure Backend**
   - Select the `backend` folder
   - Set build command: `npm install`
   - Set run command: `npm start`
   - Add environment variables

3. **Deploy**
   - DigitalOcean will build and deploy
   - Get your backend URL

#### Frontend Deployment

1. **Add Frontend Component**
   - In the same app
   - Click "Add Component"
   - Select "Static Site"
   - Choose the `frontend` folder

2. **Configure Frontend**
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Add environment variables

3. **Deploy**
   - DigitalOcean will build and deploy
   - Get your frontend URL

## 🔧 Environment Variables

### Backend (Production)

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aintru?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here
SESSION_SECRET=your_session_secret_here

# AI Services
OPENAI_API_KEY=sk-your_openai_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password_here

# Server
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
```

### Frontend (Production)

```env
VITE_API_URL=https://your-backend-domain.com
VITE_APP_NAME=Aintru
VITE_APP_VERSION=1.0.0
```

## 🌍 Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**
   - Buy a domain from any registrar
   - Configure DNS settings

2. **Backend Domain**
   - Point `api.yourdomain.com` to your backend
   - Update CORS settings

3. **Frontend Domain**
   - Point `yourdomain.com` to your frontend
   - Update API URL in frontend

### SSL Certificate

Most platforms provide free SSL certificates:
- Railway: Automatic SSL
- Heroku: Automatic SSL
- Vercel: Automatic SSL
- DigitalOcean: Automatic SSL

## 📊 Monitoring & Analytics

### Health Checks

1. **Backend Health**
   - Endpoint: `https://your-backend-url.com/health`
   - Monitor: Database connection, AI services

2. **Frontend Health**
   - Monitor: Build status, deployment status

### Error Tracking

1. **Backend Logs**
   - Check platform logs
   - Set up error tracking (Sentry, LogRocket)

2. **Frontend Logs**
   - Check browser console
   - Set up error tracking

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate API keys regularly

### CORS Configuration
- Set specific origins in production
- Remove wildcard CORS in production

### Rate Limiting
- Implement rate limiting
- Monitor API usage

### Database Security
- Use strong passwords
- Enable IP whitelisting
- Regular backups

## 🚀 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: |
          # Add deployment commands

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Frontend
        run: |
          # Add deployment commands
```

## 📈 Performance Optimization

### Backend Optimization
- Enable gzip compression
- Use CDN for static assets
- Implement caching
- Database indexing

### Frontend Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle analysis

## 🔄 Updates & Maintenance

### Regular Updates
- Update dependencies
- Security patches
- Feature updates

### Database Maintenance
- Regular backups
- Performance monitoring
- Index optimization

### Monitoring
- Uptime monitoring
- Performance monitoring
- Error tracking

## 🆘 Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables
- Verify build commands
- Check platform logs

#### Runtime Errors
- Check application logs
- Verify database connection
- Check API key validity

#### Performance Issues
- Monitor resource usage
- Check database queries
- Optimize images and assets

### Getting Help
- Check platform documentation
- Review application logs
- Contact platform support

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app/)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)

---

**Happy Deploying! 🚀**
