import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Building, Briefcase, User, ArrowRight, CheckCircle } from 'lucide-react';
import CompanyAutocomplete from './CompanyAutocomplete';
import RoleSuggestions from './RoleSuggestions';
import ResumeParser, { CandidateProfile } from './ResumeParser';

interface InterviewSetupProps {
  onSetupComplete: (setupData: InterviewSetupData) => void;
}

export interface InterviewSetupData {
  resume: File | null;
  targetCompany: string;
  targetRole: string;
  experienceLevel: string;
  interviewConfig: any;
  candidateProfile: CandidateProfile | null;
}

const InterviewSetup: React.FC<InterviewSetupProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState(1);
  const [setupData, setSetupData] = useState<InterviewSetupData>({
    resume: null,
    targetCompany: '',
    targetRole: '',
    experienceLevel: '',
    interviewConfig: null,
    candidateProfile: null
  });
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const experienceLevels = ['Fresher', '0-1 years', '1-3 years', '3+ years'];

  const handleCompanyChange = (company: string) => {
    setSetupData(prev => ({ 
      ...prev, 
      targetCompany: company,
      targetRole: '' // Reset role when company changes
    }));
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
    setSetupData(prev => ({ 
      ...prev, 
      targetCompany: company.name,
      targetRole: '' // Reset role when company changes
    }));
  };

  const handleRoleSelect = (role: any) => {
    setSelectedRole(role);
    setSetupData(prev => ({ 
      ...prev, 
      targetRole: role.title
    }));
  };

  const handleExperienceSelect = (level: string) => {
    setSetupData(prev => ({ ...prev, experienceLevel: level }));
  };

  const handleProfileExtracted = (profile: CandidateProfile) => {
    setSetupData(prev => ({ ...prev, candidateProfile: profile }));
  };

  const canProceed = () => {
    switch (step) {
      case 1: return setupData.candidateProfile !== null;
      case 2: return setupData.targetCompany.trim() !== '';
      case 3: return setupData.targetRole !== '';
      case 4: return setupData.experienceLevel !== '';
      default: return false;
    }
  };

  const nextStep = () => {
    if (canProceed()) {
      if (step === 4) {
        onSetupComplete(setupData);
      } else {
        setStep(step + 1);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > stepNumber ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Step {step} of 4
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          {/* Step 1: Resume Upload & Profile Extraction */}
          {step === 1 && (
            <div className="text-center">
              <ResumeParser onProfileExtracted={handleProfileExtracted} />
            </div>
          )}

          {/* Step 2: Target Company */}
          {step === 2 && (
            <div className="text-center">
              <Building className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter Target Company</h2>
              <p className="text-gray-600 mb-6">
                Enter any company in the world. Our AI will analyze it and create relevant interview questions.
              </p>
              <div className="max-w-md mx-auto">
                <CompanyAutocomplete
                  value={setupData.targetCompany}
                  onChange={handleCompanyChange}
                  onCompanySelect={handleCompanySelect}
                />
                {selectedCompany && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <strong>AI Analysis:</strong> {selectedCompany.type} company in {selectedCompany.industry} industry
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Target Role */}
          {step === 3 && (
            <div className="text-center">
              <RoleSuggestions
                companyName={setupData.targetCompany}
                onRoleSelect={handleRoleSelect}
                selectedRole={setupData.targetRole}
              />
            </div>
          )}

          {/* Step 4: Experience Level */}
          {step === 4 && (
            <div className="text-center">
              <User className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Experience Level</h2>
              <p className="text-gray-600 mb-6">
                This helps us tailor the interview difficulty to your experience.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experienceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => handleExperienceSelect(level)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      setupData.experienceLevel === level
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold">{level}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
            >
              <span>{step === 4 ? 'Start Interview' : 'Next'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterviewSetup; 