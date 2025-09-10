import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Database, BarChart3, FileSpreadsheet, Terminal, Play, CheckCircle } from 'lucide-react';

interface TechnicalTask {
  id: string;
  title: string;
  description: string;
  type: 'coding' | 'data-analysis' | 'sql' | 'excel' | 'devops';
  content: string;
  expectedOutput?: string;
  timeLimit: number;
}

interface TechnicalRoundProps {
  role: string;
  company: string;
  experienceLevel: string;
  onTaskComplete: (taskId: string, userOutput: string) => void;
}

const TechnicalRound: React.FC<TechnicalRoundProps> = ({
  role,
  company,
  experienceLevel,
  onTaskComplete
}) => {
  const [currentTask, setCurrentTask] = useState<TechnicalTask | null>(null);
  const [userOutput, setUserOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (currentTask) {
      setTimeRemaining(currentTask.timeLimit);
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentTask]);

  useEffect(() => {
    generateTechnicalTask();
  }, [role, company, experienceLevel]);

  const generateTechnicalTask = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/interview/generate-technical-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          company,
          experienceLevel
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate technical task');
      }

      const data = await response.json();
      setCurrentTask(data.task);
    } catch (error) {
      console.error('Error generating technical task:', error);
      // Fallback task
      setCurrentTask(getFallbackTask());
    }
  };

  const getFallbackTask = (): TechnicalTask => {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('software') || roleLower.includes('engineer')) {
      return {
        id: '1',
        title: 'Array Problem',
        description: 'Write a function to find the maximum subarray sum',
        type: 'coding',
        content: `// Write a function to find the maximum subarray sum
// Example: [-2,1,-3,4,-1,2,1,-5,4] should return 6
// The subarray [4,-1,2,1] has the largest sum

function maxSubArray(nums) {
  // Your code here
}`,
        timeLimit: 300
      };
    } else if (roleLower.includes('data') || roleLower.includes('analyst')) {
      return {
        id: '1',
        title: 'Data Analysis',
        description: 'Analyze the sales data and create insights',
        type: 'data-analysis',
        content: `Sales Data Analysis:
Month | Revenue | Customers | Avg_Order
Jan   | 50000  | 1200     | 41.67
Feb   | 55000  | 1350     | 40.74
Mar   | 60000  | 1400     | 42.86

Questions:
1. Calculate month-over-month growth rate
2. Identify trends in customer acquisition
3. Suggest improvements based on data`,
        timeLimit: 600
      };
    } else {
      return {
        id: '1',
        title: 'Problem Solving',
        description: 'Solve this business case study',
        type: 'excel',
        content: `Business Case: A company wants to optimize their marketing budget across different channels. 
Given the data, create a strategy that maximizes ROI while staying within budget constraints.`,
        timeLimit: 450
      };
    }
  };

  const handleRunCode = () => {
    setIsRunning(true);
    // Simulate code execution
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (currentTask && userOutput.trim()) {
      setIsCompleted(true);
      onTaskComplete(currentTask.id, userOutput);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'coding':
        return <Code className="w-5 h-5" />;
      case 'data-analysis':
        return <BarChart3 className="w-5 h-5" />;
      case 'sql':
        return <Database className="w-5 h-5" />;
      case 'excel':
        return <FileSpreadsheet className="w-5 h-5" />;
      case 'devops':
        return <Terminal className="w-5 h-5" />;
      default:
        return <Code className="w-5 h-5" />;
    }
  };

  if (!currentTask) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Generating technical task...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          {getTaskIcon(currentTask.type)}
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{currentTask.title}</h3>
            <p className="text-gray-600">{currentTask.description}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Time Remaining:</span>
            <span className={`font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-blue-600'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeRemaining / currentTask.timeLimit) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Task Content */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Task:</h4>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap">{currentTask.content}</pre>
        </div>
      </div>

      {/* Technical Interface */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Your Solution</h4>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning || !userOutput.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor */}
        {currentTask.type === 'coding' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-gray-400 text-sm ml-2">solution.js</span>
              </div>
              <textarea
                value={userOutput}
                onChange={(e) => setUserOutput(e.target.value)}
                placeholder="Write your code here..."
                className="w-full h-64 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded border-none focus:ring-0 resize-none"
              />
            </div>
          </div>
        )}

        {/* Data Analysis Interface */}
        {currentTask.type === 'data-analysis' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Data Input</h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm text-gray-700">{currentTask.content}</pre>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Your Analysis</h5>
                <textarea
                  value={userOutput}
                  onChange={(e) => setUserOutput(e.target.value)}
                  placeholder="Write your analysis and insights here..."
                  className="w-full h-48 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SQL Terminal */}
        {currentTask.type === 'sql' && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Terminal className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">SQL Terminal</span>
              </div>
              <textarea
                value={userOutput}
                onChange={(e) => setUserOutput(e.target.value)}
                placeholder="Write your SQL query here..."
                className="w-full h-48 bg-gray-900 text-green-400 font-mono text-sm p-4 rounded border-none focus:ring-0 resize-none"
              />
            </div>
          </div>
        )}

        {/* Excel-like Interface */}
        {currentTask.type === 'excel' && (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                <h5 className="font-semibold text-gray-900">Spreadsheet Analysis</h5>
              </div>
              <div className="p-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h6 className="font-semibold text-gray-900 mb-2">Case Study:</h6>
                  <p className="text-sm text-gray-700">{currentTask.content}</p>
                </div>
                <textarea
                  value={userOutput}
                  onChange={(e) => setUserOutput(e.target.value)}
                  placeholder="Write your analysis, calculations, and recommendations here..."
                  className="w-full h-48 border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={!userOutput.trim() || isCompleted}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
          >
            {isCompleted ? (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <span>Submit Solution</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechnicalRound; 