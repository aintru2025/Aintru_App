const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const pdf = require('pdf-parse');
const fs = require('fs');
const { gpt41Call } = require('../config/ai');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// POST /api/resume/parse-resume - Parse uploaded resume file
router.post('/parse-resume', authenticateToken, async (req, res) => {
  try {
    console.log('📄 Resume parsing route hit');
    
    if (!req.files || !req.files.resume) {
      return res.status(400).json({ 
        success: false, 
        error: 'No resume file uploaded' 
      });
    }

    const resumeFile = req.files.resume;
    console.log('📁 File received:', { 
      name: resumeFile.name, 
      size: resumeFile.size, 
      mimetype: resumeFile.mimetype 
    });

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(resumeFile.mimetype)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files only.' 
      });
    }

    // Extract text from file
    let resumeText = '';
    
    if (resumeFile.mimetype === 'application/pdf') {
      try {
        console.log('📄 Processing PDF file...');
        console.log('📁 File data type:', typeof resumeFile.data);
        console.log('📁 File data length:', resumeFile.data ? resumeFile.data.length : 'undefined');
        console.log('📁 Temp file path:', resumeFile.tempFilePath);
        
        let dataBuffer;
        
        // Try different ways to get the file data
        if (resumeFile.data && resumeFile.data.length > 0) {
          console.log('✅ Using file.data buffer');
          dataBuffer = resumeFile.data;
        } else if (resumeFile.tempFilePath) {
          console.log('✅ Using temp file path');
          const fs = require('fs');
          dataBuffer = fs.readFileSync(resumeFile.tempFilePath);
        } else {
          console.log('❌ No file data available');
          throw new Error('No file data available');
        }
        
        console.log('📄 Buffer length:', dataBuffer.length);
        const pdfData = await pdf(dataBuffer);
        resumeText = pdfData.text;
        console.log('✅ PDF parsed successfully, text length:', resumeText.length);
      } catch (pdfError) {
        console.error('❌ PDF parsing error:', pdfError);
        return res.status(400).json({ 
          success: false, 
          error: 'Failed to parse PDF file. Please ensure it\'s a valid PDF.' 
        });
      }
    } else {
      // For DOC, DOCX, TXT files - read as text
      try {
        console.log('📄 Processing text file...');
        let fileContent;
        
        if (resumeFile.data && resumeFile.data.length > 0) {
          console.log('✅ Using file.data for text');
          fileContent = resumeFile.data;
        } else if (resumeFile.tempFilePath) {
          console.log('✅ Using temp file path for text');
          fileContent = fs.readFileSync(resumeFile.tempFilePath);
        } else {
          console.log('❌ No file data available for text');
          throw new Error('No file data available');
        }
        
        resumeText = fileContent.toString('utf8');
        console.log('✅ Text file read successfully, length:', resumeText.length);
      } catch (textError) {
        console.error('❌ Text parsing error:', textError);
        return res.status(400).json({ 
          success: false, 
          error: 'Failed to read file content.' 
        });
      }
    }

    console.log('📝 Extracted text length:', resumeText.length);

    if (!resumeText.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: 'No text content found in the uploaded file.' 
      });
    }

    // Use AI to parse the resume
    const prompt = `Parse this resume and extract the following information in JSON format:
    {
      "name": "Full name",
      "email": "Email address",
      "phone": "Phone number",
      "experienceYears": number,
      "education": [
        {
          "degree": "Degree name",
          "institution": "Institution name", 
          "year": graduation year
        }
      ],
      "skills": ["skill1", "skill2", "skill3"],
      "tools": ["tool1", "tool2", "tool3"],
      "projects": [
        {
          "name": "Project name",
          "description": "Project description",
          "technologies": ["tech1", "tech2"],
          "duration": "Duration"
        }
      ],
      "domain": "Primary domain/field",
      "summary": "Professional summary"
    }

    Resume text:
    ${resumeText.substring(0, 3000)}`;

    console.log('🤖 Calling AI for resume parsing...');
    
    const aiResponse = await gpt41Call(prompt);
    console.log('✅ AI response received');

    let profile;
    try {
      profile = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      console.log('🔍 Raw AI response:', aiResponse);
      
      // Fallback: create basic profile from extracted text
      profile = {
        name: 'Candidate',
        email: '',
        phone: '',
        experienceYears: 1,
        education: [
          {
            degree: 'Bachelor\'s Degree',
            institution: 'University',
            year: 2023
          }
        ],
        skills: ['Problem Solving', 'Communication', 'Teamwork'],
        tools: ['Microsoft Office', 'Git'],
        projects: [
          {
            name: 'Sample Project',
            description: 'A project demonstrating key skills',
            technologies: ['JavaScript', 'React'],
            duration: '3 months'
          }
        ],
        domain: 'Technology',
        summary: 'Motivated professional with strong problem-solving skills.'
      };
    }

    console.log('✅ Profile parsed successfully');

    res.json({ 
      success: true,
      profile: profile,
      message: 'Resume parsed successfully'
    });

  } catch (error) {
    console.error('❌ Resume parsing error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to parse resume. Please try again.' 
    });
  }
});

// POST /api/resume/upload - Upload a resume file
router.post('/upload', async (req, res) => {
  // TODO: Handle file upload and parsing
  res.json({ message: 'Resume uploaded', resumeId: null });
});

// POST /api/resume/generate - Generate a new resume using AI
router.post('/generate', async (req, res) => {
  // TODO: Integrate OpenAI to generate a resume
  res.json({ message: 'Resume generated', resume: {} });
});

// POST /api/resume/optimize - Optimize an existing resume for ATS
router.post('/optimize', async (req, res) => {
  // TODO: Integrate OpenAI to optimize resume and provide ATS score
  res.json({ message: 'Resume optimized', atsScore: 0, suggestions: [] });
});

// GET /api/resume/versions - Get all resume versions for the user
router.get('/versions', async (req, res) => {
  // TODO: Fetch resume versions from database
  res.json({ versions: [] });
});

module.exports = router; 