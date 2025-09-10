import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Search, Check } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

interface CompanyAutocompleteProps {
  onCompanySelect: (company: string, companyType: string) => void;
}

const CompanyAutocomplete: React.FC<CompanyAutocompleteProps> = ({ onCompanySelect }) => {
  const { getToken } = useAuthStore();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedCompanyType, setSelectedCompanyType] = useState('');
  const [showCompanyTypes, setShowCompanyTypes] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const companyTypes = [
    'Technology/Software',
    'Finance/Banking',
    'Healthcare/Medical',
    'Education',
    'Manufacturing',
    'Retail/E-commerce',
    'Consulting',
    'Media/Entertainment',
    'Government/Public Sector',
    'Non-profit',
    'Startup',
    'Other'
  ];

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSuggestions();
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch('http://localhost:3000/api/interviewFlow/company-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error fetching company suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySelect = (company: string) => {
    setSelectedCompany(company);
    setQuery(company);
    setShowSuggestions(false);
    // If company type is already selected, call onCompanySelect immediately
    if (selectedCompanyType) {
      onCompanySelect(company, selectedCompanyType);
    }
  };

  const handleCompanyTypeSelect = (companyType: string) => {
    setSelectedCompanyType(companyType);
    setShowCompanyTypes(false);
    // If company is already selected, call onCompanySelect immediately
    if (selectedCompany) {
      onCompanySelect(selectedCompany, companyType);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedCompany('');
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <div className="space-y-6">
      {/* Company Name Input */}
      <div className="relative max-w-md mx-auto">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder="Start typing your target company..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          {loading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
            >
              <ul className="py-1">
                {suggestions.map((company, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleCompanySelect(company)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Building className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{company}</span>
                      </div>
                      {selectedCompany === company && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Company Type Selection */}
      <div className="max-w-md mx-auto">
        <p className="text-sm text-gray-600 mb-3 text-center">Or select a company type:</p>
        <div className="grid grid-cols-2 gap-2">
          {companyTypes.map((type) => (
            <button
              key={type}
              onClick={() => handleCompanyTypeSelect(type)}
              className={`p-3 text-sm border-2 rounded-lg transition-colors ${
                selectedCompanyType === type
                  ? 'border-green-400 bg-green-50 text-green-800'
                  : 'border-gray-200 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {(selectedCompany || selectedCompanyType) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm text-green-800">
              {selectedCompany && selectedCompanyType ? (
                <>Selected: <strong>{selectedCompany}</strong> ({selectedCompanyType})</>
              ) : selectedCompany ? (
                <>Selected: <strong>{selectedCompany}</strong></>
              ) : (
                <>Selected: <strong>{selectedCompanyType}</strong></>
              )}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CompanyAutocomplete; 