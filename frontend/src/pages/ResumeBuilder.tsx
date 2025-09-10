import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { 
  FileText, 
  Download, 
  Eye, 
  Zap, 
  TrendingUp, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import logo from '../assets/aintru-logo.png';

const ResumeBuilder = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [atsScore, setAtsScore] = useState(78);
  const [activeSection, setActiveSection] = useState('personal');

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { message: 'Please login to access Resume Builder' }
      });
    }
  }, [isAuthenticated, navigate]);
  const [resumeData, setResumeData] = useState({
    personal: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson'
    },
    summary: 'Passionate software engineer with 3+ years of experience building scalable web applications...',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechCorp',
        duration: '2022 - Present',
        description: 'Led development of microservices architecture serving 1M+ users daily'
      }
    ],
    education: [
      {
        degree: 'BS Computer Science',
        school: 'University of California, Berkeley',
        year: '2020'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker']
  });

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: FileText },
    { id: 'summary', name: 'Summary', icon: FileText },
    { id: 'experience', name: 'Experience', icon: FileText },
    { id: 'education', name: 'Education', icon: FileText },
    { id: 'skills', name: 'Skills', icon: FileText }
  ];

  const optimizationTips = [
    { type: 'success', text: 'Great use of action verbs in experience section' },
    { type: 'warning', text: 'Consider adding more quantifiable achievements' },
    { type: 'error', text: 'Missing keywords for target role' }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const getScoreIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'error': return AlertCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600 mt-2">Create an ATS-optimized resume that gets noticed</p>
          </div>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </button>
            <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* ATS Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">ATS Optimization Score</h3>
              <p className="text-gray-600">Your resume's compatibility with Applicant Tracking Systems</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">{atsScore}%</div>
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mt-2">
                <img src={logo} alt="Aintru Logo" className="w-6 h-auto" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${atsScore}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className={`bg-gradient-to-r ${getScoreColor(atsScore)} h-3 rounded-full`}
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Editor Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm">
              {/* Section Tabs */}
              <div className="border-b border-gray-200 p-6">
                <div className="flex space-x-1 overflow-x-auto">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSection === section.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6">
                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={resumeData.personal.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, name: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={resumeData.personal.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, email: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          value={resumeData.personal.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, phone: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                          type="text"
                          value={resumeData.personal.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            personal: { ...prev.personal, location: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'summary' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                    <textarea
                      value={resumeData.summary}
                      onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write a compelling summary that highlights your key achievements and skills..."
                    />
                    <p className="text-sm text-gray-500">
                      Tip: Use 2-3 sentences that highlight your key achievements and skills relevant to your target role.
                    </p>
                  </div>
                )}

                {activeSection === 'experience' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                        <Plus className="w-4 h-4" />
                        <span>Add Experience</span>
                      </button>
                    </div>
                    
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                              <input
                                type="text"
                                value={exp.title}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <input
                                type="text"
                                value={exp.company}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              />
                            </div>
                          </div>
                          <button className="text-red-500 hover:text-red-700 ml-4">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                          <input
                            type="text"
                            value={exp.duration}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={exp.description}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {resumeData.skills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <button className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Optimization Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Optimization Tips
              </h3>
              <div className="space-y-3">
                {optimizationTips.map((tip, index) => {
                  const Icon = getScoreIcon(tip.type);
                  return (
                    <div key={index} className="flex items-start space-x-2">
                      <Icon className={`w-4 h-4 mt-0.5 ${
                        tip.type === 'success' ? 'text-green-500' :
                        tip.type === 'warning' ? 'text-yellow-500' :
                        'text-red-500'
                      }`} />
                      <p className="text-sm text-gray-700">{tip.text}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Resume Templates */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-blue-500 rounded-lg p-3 text-center">
                  <div className="w-full h-16 bg-blue-100 rounded mb-2"></div>
                  <p className="text-xs font-medium text-blue-600">Modern</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-gray-300 cursor-pointer">
                  <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                  <p className="text-xs font-medium text-gray-600">Classic</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-gray-300 cursor-pointer">
                  <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                  <p className="text-xs font-medium text-gray-600">Creative</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-3 text-center hover:border-gray-300 cursor-pointer">
                  <div className="w-full h-16 bg-gray-100 rounded mb-2"></div>
                  <p className="text-xs font-medium text-gray-600">Tech</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;