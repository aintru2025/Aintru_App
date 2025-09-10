import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, User, GraduationCap, Code, Briefcase, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export interface CandidateProfile {
  name: string;
  email?: string;
  phone?: string;
  experienceYears: number;
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  skills: string[];
  tools: string[];
  projects: {
    name: string;
    description: string;
    technologies: string[];
    duration: string;
  }[];
  domain: string;
  summary: string;
}

interface ResumeParserProps {
  onProfileExtracted: (profile: CandidateProfile) => void;
}

const ResumeParser: React.FC<ResumeParserProps> = ({ onProfileExtracted }) => {
  const { getToken, isAuthenticated } = useAuthStore();
  const [isParsing, setIsParsing] = useState(false);
  const [parsedProfile, setParsedProfile] = useState<CandidateProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'idle' | 'uploading' | 'parsing' | 'complete'>('idle');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      setError('Please log in to upload your resume');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid file type: PDF, DOC, DOCX, or TXT');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setIsParsing(true);
    setError(null);
    setUploadProgress(0);
    setCurrentStep('uploading');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      setCurrentStep('parsing');
      
      const token = getToken();
      console.log('🔑 Token available:', !!token);
      console.log('🔑 Token length:', token ? token.length : 0);
      
      const response = await fetch('http://localhost:3000/api/resume/parse-resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to parse resume');
      }

      const data = await response.json();
      console.log('Resume parsing response:', data);
      
      if (data.profile) {
        setParsedProfile(data.profile);
        onProfileExtracted(data.profile);
        setCurrentStep('complete');
      } else {
        throw new Error('No profile data received');
      }
    } catch (error) {
      console.error('Error parsing resume:', error);
      setError(error instanceof Error ? error.message : 'Failed to parse resume. Please try again.');
      setUploadProgress(0);
      setCurrentStep('idle');
      // Clear any previously parsed profile when there's an error
      setParsedProfile(null);
    } finally {
      setIsParsing(false);
    }
  };

  const createFallbackProfile = (file: File) => {
    // Create a basic profile structure for fallback
    const fallbackProfile: CandidateProfile = {
      name: 'Candidate',
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

    setParsedProfile(fallbackProfile);
    onProfileExtracted(fallbackProfile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const input = document.createElement('input');
      input.type = 'file';
      input.files = files;
      input.dispatchEvent(new Event('change'));
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <div className="text-center">
        <div
          className="w-full max-w-md mx-auto p-6 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById('resume-upload')?.click()}
        >
          <input
            id="resume-upload"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Drag & drop your resume here, or click to browse
          </p>
          <p className="text-sm text-gray-400 mt-2">(PDF, DOC, DOCX, TXT)</p>
        </div>

        {/* Progress Meter */}
        {isParsing && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-600">
                {currentStep === 'uploading' ? 'Uploading resume...' : 
                 currentStep === 'parsing' ? 'AI is analyzing your resume...' : 
                 'Processing...'}
              </span>
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              {uploadProgress}% complete
            </p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Parsed Profile Display */}
      {parsedProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center space-x-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900">Profile Extracted Successfully</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-gray-900">Basic Information</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <p className="font-medium">{parsedProfile.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Experience:</span>
                  <p className="font-medium">{parsedProfile.experienceYears} years</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Domain:</span>
                  <p className="font-medium">{parsedProfile.domain}</p>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900">Education</h4>
              </div>
              <div className="space-y-2">
                {parsedProfile.education.map((edu, index) => (
                  <div key={index}>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.institution} ({edu.year})</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-gray-900">Skills</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedProfile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold text-gray-900">Tools</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedProfile.tools.map((tool, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          {parsedProfile.projects.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900">Key Projects</h4>
              <div className="space-y-3">
                {parsedProfile.projects.map((project, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900">{project.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Professional Summary</h4>
            <p className="text-blue-800 text-sm">{parsedProfile.summary}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeParser; 