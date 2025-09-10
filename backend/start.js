const app = require('./index');
const mongoose = require('mongoose');
const config = require('./config/production');

const PORT = process.env.PORT || 3000;

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Aintru Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Database: ${config.database.url}`);
  console.log(`🤖 AI Services: ${process.env.OPENAI_API_KEY ? 'OpenAI ✅' : 'OpenAI ❌'}`);
  console.log(`🎤 Speech: ${process.env.DEEPGRAM_API_KEY ? 'Deepgram ✅' : 'Deepgram ❌'}`);
});

// Graceful shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    services: {
      openai: !!process.env.OPENAI_API_KEY,
      deepgram: !!process.env.DEEPGRAM_API_KEY
    }
  };
  
  res.status(200).json(health);
});

console.log('🔧 Production server initialized'); 