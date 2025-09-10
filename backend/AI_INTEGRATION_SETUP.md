# AI Integration Setup Guide

This guide explains how to set up all the AI services for Aintru's interview platform.

## Required API Keys

### 1. OpenAI API Key (GPT-4)
**Used for:** Company/role suggestions, resume parsing
**Get it from:** https://platform.openai.com/api-keys
**Cost:** ~$0.03 per 1K tokens

### 2. Anthropic API Key (Claude 3 Opus)
**Used for:** Interview question generation, comprehensive feedback
**Get it from:** https://console.anthropic.com/
**Cost:** ~$0.15 per 1K tokens

### 3. Deepgram API Key (Voice-to-Text)
**Used for:** Transcribing interview answers
**Get it from:** https://console.deepgram.com/
**Cost:** ~$0.0044 per minute

### 4. ElevenLabs API Key (Text-to-Speech)
**Used for:** AI interviewer speaking
**Get it from:** https://elevenlabs.io/
**Cost:** ~$0.30 per 1K characters

## Environment Variables

Add these to your `.env` file:

```env
# AI Service API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key-here
DEEPGRAM_API_KEY=your-deepgram-api-key-here
ELEVENLABS_API_KEY=your-elevenlabs-api-key-here
```

## AI Service Features

### Company/Role Suggestions (OpenAI GPT-4)
- **Endpoint:** `/api/interview/company-suggestions`
- **Function:** Suggests real companies based on partial input
- **Fallback:** Intelligent keyword-based suggestions

### Resume Parsing (OpenAI GPT-4)
- **Endpoint:** `/api/interview/parse-resume`
- **Function:** Extracts structured profile from resume
- **Fallback:** Basic profile template

### Interview Questions (Claude 3 Opus)
- **Endpoint:** `/api/interview/generate-questions`
- **Function:** Generates role-specific, experience-appropriate questions
- **Fallback:** Predefined questions by company type

### Technical Tasks (OpenAI GPT-4)
- **Endpoint:** `/api/interview/generate-technical-task`
- **Function:** Creates coding/data analysis tasks
- **Fallback:** Role-based task templates

### Comprehensive Feedback (Claude 3 Opus)
- **Endpoint:** `/api/interview/generate-feedback`
- **Function:** Analyzes interview performance and provides detailed feedback
- **Fallback:** Score-based feedback generation

## Testing AI Integration

1. **Without API Keys:** The system will use fallback functions
2. **With API Keys:** Real AI responses will be generated
3. **Error Handling:** All AI calls are wrapped with error handling

## Cost Estimation

For 100 interviews per month:
- **OpenAI:** ~$5-10/month
- **Anthropic:** ~$15-25/month
- **Deepgram:** ~$2-5/month
- **ElevenLabs:** ~$10-20/month
- **Total:** ~$32-60/month

## Next Steps

1. Get API keys from the respective services
2. Add them to your `.env` file
3. Test the endpoints to ensure they work
4. Monitor usage and costs
5. Implement voice/video features (MediaPipe integration)

## MediaPipe Integration (Local)

MediaPipe runs locally and doesn't require API keys. It's used for:
- Facial expression analysis
- Eye contact detection
- Posture analysis
- Confidence scoring

This will be implemented in the frontend components. 