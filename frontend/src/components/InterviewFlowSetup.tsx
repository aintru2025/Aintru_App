import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Building, Briefcase, User, ArrowRight, CheckCircle, Clock, GraduationCap, Briefcase as BriefcaseIcon, DollarSign, Target, FileText } from 'lucide-react';
import ResumeParser from './ResumeParser';
import CompanyAutocomplete from './CompanyAutocomplete';
import RoleSuggestions from './RoleSuggestions';
import { useAuthStore } from '../stores/authStore';

interface InterviewFlowSetupProps {
  onSetupComplete: (setupData: any) => void;
}

interface SetupData {
  preparationType: 'exam' | 'job' | null;
  // Exam data
  examName: string;
  examDescription: string;
  // Job/Internship data
  candidateProfile: any;
  company: string;
  companyType: string;
  role: string;
  experienceLevel: string;
  expectedCTC: string;
  interviewFlow: any;
}

const InterviewFlowSetup: React.FC<InterviewFlowSetupProps> = ({ onSetupComplete }) => {
  const { getToken } = useAuthStore();
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState<SetupData>({
    preparationType: null,
    examName: '',
    examDescription: '',
    candidateProfile: null,
    company: '',
    companyType: '',
    role: '',
    experienceLevel: '',
    expectedCTC: '',
    interviewFlow: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const experienceLevels = ['Fresher', '0-1 years', '1-3 years', '3+ years'];
  const ctcRanges = ['0-3 LPA', '3-6 LPA', '6-10 LPA', '10-15 LPA', '15-25 LPA', '25+ LPA'];

  // Step 1: Choose preparation type
  const handlePreparationTypeSelect = (type: 'exam' | 'job') => {
    setSetupData(prev => ({ ...prev, preparationType: type }));
    setStep(2);
  };

  // Exam flow handlers
  const handleExamDetailsSubmit = (examName: string, examDescription: string) => {
    setSetupData(prev => ({ ...prev, examName, examDescription }));
    setStep(3); // Go to AI processing
  };

  const handleExamFlowGenerated = (interviewFlow: any) => {
    setSetupData(prev => ({ ...prev, interviewFlow }));
    setStep(4); // Show exam flow preview
  };

  // Job/Internship flow handlers
  const handleProfileExtracted = (profile: any) => {
    setSetupData(prev => ({ ...prev, candidateProfile: profile }));
    setStep(3); // Go to experience selection
  };

  const handleExperienceSelect = (level: string) => {
    setSetupData(prev => ({ ...prev, experienceLevel: level }));
    setStep(4); // Go to CTC selection
  };

  const handleCTCSelect = (ctc: string) => {
    setSetupData(prev => ({ ...prev, expectedCTC: ctc }));
    setStep(5); // Go to company selection
  };

  const handleCompanySelect = (company: string, companyType: string) => {
    setSetupData(prev => ({ ...prev, company, companyType }));
    setStep(6); // Go to role selection
  };

  const handleRoleSelect = (role: string) => {
    setSetupData(prev => ({ ...prev, role }));
    setStep(7); // Go to interview flow generation
  };

  const generateInterviewFlow = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      const endpoint = setupData.preparationType === 'exam' 
        ? 'http://localhost:3000/api/interviewFlow/generate-exam-flow'
        : 'http://localhost:3000/api/interviewFlow/generate-interview-flow';

      const requestBody = setupData.preparationType === 'exam' 
        ? {
            examName: setupData.examName,
            examDescription: setupData.examDescription
          }
        : {
            company: setupData.company,
            role: setupData.role,
            experience: setupData.experienceLevel,
            expectedCTC: setupData.expectedCTC,
            candidateProfileId: setupData.candidateProfile?._id
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSetupData(prev => ({ ...prev, interviewFlow: data.interviewFlow }));
        if (setupData.preparationType === 'exam') {
          setStep(4); // Show exam flow preview
        } else {
          setStep(8); // Show job flow preview
        }
      } else if (data.fallback) {
        // Use fallback data if provided
        setSetupData(prev => ({ 
          ...prev, 
          interviewFlow: {
            company: setupData.company,
            role: setupData.role,
            experienceLevel: setupData.experienceLevel,
            rounds: data.fallback.rounds,
            totalDuration: data.fallback.rounds.reduce((total, round) => {
              const durationStr = round.duration || "30 mins";
              const minutesMatch = durationStr.match(/(\d+)/);
              const duration = minutesMatch ? parseInt(minutesMatch[1]) : 30;
              return total + duration;
            }, 0)
          }
        }));
        if (setupData.preparationType === 'exam') {
          setStep(4);
        } else {
          setStep(8);
        }
      } else {
        // Handle specific exam not found error
        if (data.error === 'Exam not found' && setupData.preparationType === 'exam') {
          setError(`Exam not found: ${data.message}`);
          // Go back to exam details step to let user correct the exam name
          setStep(2);
        } else {
          throw new Error(data.error || 'Failed to generate interview flow');
        }
      }
    } catch (error) {
      console.error('❌ Error generating interview flow:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate interview flow. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFlow = () => {
    onSetupComplete(setupData);
  };

  useEffect(() => {
    if (setupData.preparationType === 'exam' && step === 3) {
      generateInterviewFlow();
    } else if (setupData.preparationType === 'job' && step === 7) {
      generateInterviewFlow();
    }
  }, [step, setupData.preparationType]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">What are you preparing for?</h2>
              <p className="text-gray-600 mb-8">
                Choose your preparation type to get a personalized interview experience.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <button
                onClick={() => handlePreparationTypeSelect('exam')}
                className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform"
              >
                <GraduationCap className="w-12 h-12 mb-4" />
                <span className="font-bold text-xl mb-2">Exam Preparation</span>
                <span className="text-purple-100 text-sm text-center">
                  Preparing for competitive exams, entrance tests, or academic interviews
                </span>
              </button>
              <button
                onClick={() => handlePreparationTypeSelect('job')}
                className="bg-gradient-to-br from-blue-500 to-green-600 text-white rounded-2xl p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-transform"
              >
                <BriefcaseIcon className="w-12 h-12 mb-4" />
                <span className="font-bold text-xl mb-2">Job/Internship</span>
                <span className="text-blue-100 text-sm text-center">
                  Preparing for job interviews, internships, or career opportunities
                </span>
              </button>
            </div>
          </div>
        );

      case 2:
        if (setupData.preparationType === 'exam') {
          return <ExamDetailsForm onSubmit={handleExamDetailsSubmit} error={error} />;
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Upload className="w-16 h-16 text-blue-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Upload Your Resume</h2>
                <p className="text-gray-600 mb-6">
                  Upload your resume to extract your profile and personalize your interview experience.
                </p>
              </div>
              <ResumeParser onProfileExtracted={handleProfileExtracted} />
            </div>
          );
        }

      case 3:
        if (setupData.preparationType === 'exam') {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <Clock className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Generating Exam Interview Flow</h2>
                <p className="text-gray-600 mb-6">
                  Creating your personalized exam interview experience based on "{setupData.examName}"...
                </p>
              </div>
              {loading && (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Generating interview flow...</span>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>
          );
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <User className="w-16 h-16 text-orange-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Select Experience Level</h2>
                <p className="text-gray-600 mb-6">
                  Choose your experience level for personalized interview questions.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleExperienceSelect(level)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <span className="font-medium">{level}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        }

      case 4:
        if (setupData.preparationType === 'exam') {
          return <ExamFlowPreview flow={setupData.interviewFlow} onAccept={handleAcceptFlow} />;
        } else {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <DollarSign className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Expected CTC</h2>
                <p className="text-gray-600 mb-6">
                  Select your expected salary range.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {ctcRanges.map((ctc) => (
                  <button
                    key={ctc}
                    onClick={() => handleCTCSelect(ctc)}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors"
                  >
                    <span className="font-medium">{ctc}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        }

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 4: Choose Your Target Company</h2>
              <p className="text-gray-600 mb-6">
                Select the company you want to interview for or choose a company type.
              </p>
            </div>
            <CompanyAutocomplete onCompanySelect={handleCompanySelect} />
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Briefcase className="w-16 h-16 text-purple-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 5: Select Your Role</h2>
              <p className="text-gray-600 mb-6">
                Choose the role you're applying for at {setupData.company || 'your target company'}.
              </p>
            </div>
            <RoleSuggestions 
              company={setupData.company}
              experience={setupData.experienceLevel}
              onRoleSelect={handleRoleSelect}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="w-16 h-16 text-indigo-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 6: Generating Interview Flow</h2>
              <p className="text-gray-600 mb-6">
                Creating your personalized interview experience...
              </p>
            </div>
            {loading && (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Generating interview flow...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>
        );

      case 8:
        return <JobFlowPreview flow={setupData.interviewFlow} onAccept={handleAcceptFlow} />;

      default:
        return null;
    }
  };

  const getProgressSteps = () => {
    if (setupData.preparationType === 'exam') {
      return [1, 2, 3, 4]; // Choice, Exam Details, Generate, Preview
    } else {
      return [1, 2, 3, 4, 5, 6, 7, 8]; // Choice, Resume, Experience, CTC, Company, Role, Generate, Preview
    }
  };

  const getCurrentStepNumber = () => {
    if (setupData.preparationType === 'exam') {
      return step;
    } else {
      return step;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {getProgressSteps().map((stepNumber, index) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  stepNumber <= getCurrentStepNumber() 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber < getCurrentStepNumber() ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {index < getProgressSteps().length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    stepNumber < getCurrentStepNumber() ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderStep()}
        </motion.div>
      </div>
    </div>
  );
};

// Exam Details Form Component
const ExamDetailsForm: React.FC<{ onSubmit: (examName: string, examDescription: string) => void; error?: string }> = ({ onSubmit, error }) => {
  const [examName, setExamName] = useState('');
  const [examDescription, setExamDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (examName.trim()) {
      onSubmit(examName.trim(), examDescription.trim());
    }
  };

  const suggestedExams = [
    'GATE', 'CAT', 'UPSC', 'GRE', 'TOEFL', 'IELTS', 'GMAT', 'SAT', 'ACT',
    'JEE', 'NEET', 'CLAT', 'AILET', 'XAT', 'SNAP', 'NMAT', 'IIFT',
    'SSC', 'Banking', 'Railway', 'Defense', 'Teaching', 'Medical'
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <FileText className="w-16 h-16 text-purple-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 2: Exam Details</h2>
        <p className="text-gray-600 mb-6">
          Tell us about the exam you're preparing for.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm mb-3">{error}</p>
          <div className="text-sm text-red-700">
            <p className="font-medium mb-2">Popular exam names:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedExams.slice(0, 8).map((exam) => (
                <button
                  key={exam}
                  onClick={() => setExamName(exam)}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs hover:bg-red-200 transition-colors"
                >
                  {exam}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Name *
          </label>
          <input
            type="text"
            value={examName}
            onChange={(e) => setExamName(e.target.value)}
            placeholder="e.g., GATE, CAT, UPSC, GRE, TOEFL"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Description (Optional)
          </label>
          <textarea
            value={examDescription}
            onChange={(e) => setExamDescription(e.target.value)}
            placeholder="Describe the exam, its format, or any specific requirements..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors font-medium"
        >
          Generate Interview Flow
        </button>
      </form>
    </div>
  );
};

// Exam Flow Preview Component
const ExamFlowPreview: React.FC<{ flow: any; onAccept: () => void }> = ({ flow, onAccept }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 3: Interview Flow Preview</h2>
        <p className="text-gray-600 mb-6">
          Here's your personalized interview flow for the exam preparation.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Interview Process</h3>
        <div className="space-y-4">
          {flow?.rounds?.map((round: any, index: number) => (
            <div key={index} className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">{round.name}</h4>
              <p className="text-gray-600 text-sm">{round.description}</p>
              <p className="text-purple-600 text-sm font-medium">{round.duration}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Duration: <span className="font-medium">{flow?.totalDuration || 'N/A'} minutes</span>
          </p>
        </div>
      </div>

      <button
        onClick={onAccept}
        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
      >
        Accept & Start Interview
      </button>
    </div>
  );
};

// Job Flow Preview Component
const JobFlowPreview: React.FC<{ flow: any; onAccept: () => void }> = ({ flow, onAccept }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 7: Interview Flow Preview</h2>
        <p className="text-gray-600 mb-6">
          Here's your personalized interview flow based on your target company and role.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Interview Process</h3>
        <div className="space-y-4">
          {flow?.rounds?.map((round: any, index: number) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">{round.name}</h4>
              <p className="text-gray-600 text-sm">{round.description}</p>
              <p className="text-blue-600 text-sm font-medium">{round.duration}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Total Duration: <span className="font-medium">{flow?.totalDuration || 'N/A'} minutes</span>
          </p>
        </div>
      </div>

      <button
        onClick={onAccept}
        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium"
      >
        Accept & Start Interview
      </button>
    </div>
  );
};

export default InterviewFlowSetup; 