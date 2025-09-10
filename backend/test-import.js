try {
  console.log('🔍 Testing interviewFlow import...');
  const interviewFlowRoutes = require('./routes/interviewFlow');
  console.log('✅ interviewFlow imported successfully');
  console.log('📋 Routes:', Object.keys(interviewFlowRoutes.stack || {}));
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('📝 Stack trace:', error.stack);
} 