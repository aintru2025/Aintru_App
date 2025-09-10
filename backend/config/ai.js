const OpenAI = require('openai');

// AI Service Configuration
const aiConfig = {
  // OpenAI Configuration (GPT-4.1 for setup, GPT-4o for real-time)
  openai: process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false
  }) : null,

  // Deepgram Configuration (Voice-to-text) - Initialize with fresh API key
  deepgram: null, // Will be initialized lazily when needed

  // MediaPipe Configuration (Webcam analysis - local)
  mediapipe: {
    // MediaPipe runs locally, no API key needed
    faceMesh: null, // Will be initialized when needed
    poseDetection: null
  }
};

// Helper function to check if AI services are available
const checkAIServices = () => {
  const services = {
    openai: !!process.env.OPENAI_API_KEY,
    deepgram: !!process.env.DEEPGRAM_API_KEY,
    mediapipe: true // Always available (local)
  };

  console.log('AI Services Status:', services);
  return services;
};

// Helper function to clean GPT response (remove markdown formatting)
const cleanGPTResponse = (response) => {
  if (!response) return response;
  
  // Remove markdown code blocks
  let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
  cleaned = cleaned.replace(/```\s*/g, '').replace(/```\s*$/g, '');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  return cleaned;
};

// Error handling wrapper for AI calls
const safeAICall = async (aiFunction, fallbackFunction, errorMessage = 'AI service unavailable') => {
  try {
    const result = await aiFunction();
    return cleanGPTResponse(result);
  } catch (error) {
    console.error(`AI Error: ${errorMessage}`, error.message);
    return fallbackFunction();
  }
};

// GPT-4.1 Helper for resume parsing and setup (better accuracy)
const gpt41Call = async (prompt, maxTokens = 500) => {
  if (!process.env.OPENAI_API_KEY || !aiConfig.openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await aiConfig.openai.chat.completions.create({
      model: "gpt-4o-mini", // Using GPT-4o-mini as closest to GPT-4.1
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    });

    return cleanGPTResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI service unavailable');
  }
};

// GPT-4o Helper for real-time interview logic (fastest responses)
const gpt4oCall = async (prompt, maxTokens = 500) => {
  if (!process.env.OPENAI_API_KEY || !aiConfig.openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await aiConfig.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    });

    return cleanGPTResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('OpenAI service unavailable');
  }
};

// GPT-4o Speech-to-Speech (Voice Interviewer)
const gpt4oSTS = async (prompt, maxTokens = 200) => {
  if (!process.env.OPENAI_API_KEY || !aiConfig.openai) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await aiConfig.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.8
    });

    return cleanGPTResponse(completion.choices[0].message.content);
  } catch (error) {
    console.error('OpenAI STS error:', error);
    throw new Error('Voice interviewer unavailable');
  }
};

// Deepgram Helper for voice-to-text (with fresh API key and robust error handling)
const transcribeAudio = async (audioBuffer) => {
  if (!process.env.DEEPGRAM_API_KEY) {
    return "Audio transcription service not available. Please type your response.";
  }

  try {
    // Initialize Deepgram lazily
    if (!aiConfig.deepgram) {
      try {
        const { Deepgram } = require('@deepgram/sdk');
        aiConfig.deepgram = new Deepgram(process.env.DEEPGRAM_API_KEY);
        console.log('✅ Deepgram initialized successfully');
      } catch (initError) {
        console.error('Deepgram initialization failed:', initError.message);
        return "Audio transcription service not available. Please type your response.";
      }
    }

    // Use the v3 API format
    const response = await aiConfig.deepgram.transcription.preRecorded(
      { buffer: audioBuffer, mimetype: 'audio/wav' },
      {
        smart_format: true,
        model: 'nova-2',
        language: 'en-US'
      }
    );

    return response.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error('Deepgram transcription error:', error);
    return "Audio transcription failed. Please type your response.";
  }
};

// MediaPipe Helper for video analysis (placeholder for now)
const analyzeVideo = async (videoFrame) => {
  // This will be implemented with actual MediaPipe integration
  // For now, return simulated data
  return {
    eyeContact: Math.random() * 10,
    stress: Math.random() * 10,
    posture: Math.random() * 10,
    distraction: Math.random() * 10,
    confidence: Math.random() * 10
  };
};

module.exports = {
  aiConfig,
  checkAIServices,
  safeAICall,
  gpt41Call,
  gpt4oCall,
  gpt4oSTS,
  transcribeAudio,
  analyzeVideo
}; 