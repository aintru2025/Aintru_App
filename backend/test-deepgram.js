// Simple Deepgram v4 test
require('dotenv').config();

async function testDeepgram() {
  console.log('🔍 Testing Deepgram v4 Integration...\n');
  
  if (!process.env.DEEPGRAM_API_KEY) {
    console.log('❌ No Deepgram API key found');
    return;
  }

  try {
    console.log('📦 Loading Deepgram SDK...');
    const { Deepgram } = require('@deepgram/sdk');
    
    console.log('🔑 Initializing Deepgram with API key...');
    const deepgram = new Deepgram({
      api_key: process.env.DEEPGRAM_API_KEY
    });
    
    console.log('✅ Deepgram v4 initialized successfully!');
    console.log('✅ Ready for voice transcription');
    
  } catch (error) {
    console.log('❌ Deepgram Error:', error.message);
    console.log('🔧 Error details:', error);
  }
}

testDeepgram().catch(console.error); 