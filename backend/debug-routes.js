const express = require('express');
const app = express();

// Import the auth routes
const authRoutes = require('./routes/auth');

// Log all registered routes
function logRoutes(router, prefix = '') {
  console.log(`\n🔍 Routes registered in ${prefix || 'router'}:`);
  
  if (router.stack) {
    router.stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods);
        const path = layer.route.path;
        console.log(`   ${methods.join(',').toUpperCase()} ${prefix}${path}`);
      } else if (layer.name === 'router') {
        // This is a mounted router
        logRoutes(layer.handle, prefix + (layer.regexp.source.replace(/^\\\//, '').replace(/\\\//g, '/') || ''));
      }
    });
  }
}

// Test the auth routes
console.log('🧪 Debugging Auth Routes Registration...\n');

try {
  console.log('✅ Auth routes imported successfully');
  console.log('📋 Router type:', typeof authRoutes);
  console.log('🔗 Router methods:', Object.keys(authRoutes));
  
  // Log all routes in auth router
  logRoutes(authRoutes, '/api/auth');
  
  console.log('\n✅ Debug complete!');
  
} catch (error) {
  console.error('❌ Error importing auth routes:', error.message);
  console.error('📋 Stack trace:', error.stack);
}


