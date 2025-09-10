require('dotenv').config();
const { gpt41Call } = require('./config/ai');

async function testGPTAPI() {
  console.log('🧪 Testing GPT API...\n');
  
  try {
    console.log('📝 Testing simple prompt...');
    const response = await gpt41Call('Say "Hello World" in JSON format: {"message": "Hello World"}', 50);
    console.log('✅ GPT API Response:', response);
    
    console.log('\n📝 Testing resume parsing prompt...');
    const resumePrompt = `Parse this resume and return name, email, phone, education, experience (years), skills, and past job roles in JSON format.

    Resume content: John Doe
    Software Engineer
    john.doe@email.com
    Experience: 3 years
    Skills: JavaScript, React, Node.js

    Return only a valid JSON object with this structure:
    {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "phone number",
      "experience": number,
      "skills": ["skill1", "skill2"],
      "education": {
        "degree": "Degree Name",
        "institution": "University/College",
        "year": graduation_year
      },
      "lastRole": "Most recent job title",
      "domain": "primary domain/field",
      "summary": "brief professional summary"
    }`;
    
    const resumeResponse = await gpt41Call(resumePrompt, 500);
    console.log('✅ Resume Parsing Response:', resumeResponse);
    
    // Try to parse the response
    try {
      const parsed = JSON.parse(resumeResponse);
      console.log('✅ JSON Parsing Success:', parsed);
    } catch (parseError) {
      console.log('❌ JSON Parsing Failed:', parseError.message);
      console.log('Raw response:', resumeResponse);
    }
    
  } catch (error) {
    console.error('❌ GPT API Error:', error.message);
    console.error('Full error:', error);
  }
}

testGPTAPI().catch(console.error); 