import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Video, VideoOff, Send, Code, MessageCircle, Clock, Eye, Brain } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface InterviewExecutionProps {
  setupData: any;
  mode: 'voice' | 'video';
  onInterviewComplete: (results: any) => void;
}

interface InterviewState {
  currentRound: number;
  currentQuestion: string;
  isListening: boolean;
  isRecording: boolean;
  transcript: string;
  confidence: number;
  mediaPipeData: {
    eyeContact: number;
    stress: number;
    posture: number;
    distraction: number;
  };
  codeOutput: string;
  roundScores: number[];
  totalDuration: number;
}

const InterviewExecution: React.FC<InterviewExecutionProps> = ({ 
  setupData, 
  mode, 
  onInterviewComplete 
}) => {
  const [state, setState] = useState<InterviewState>({
    currentRound: 1,
    currentQuestion: '',
    isListening: false,
    isRecording: false,
    transcript: '',
    confidence: 0,
    mediaPipeData: {
      eyeContact: 0,
      stress: 0,
      posture: 0,
      distraction: 0
    },
    codeOutput: '',
    roundScores: [],
    totalDuration: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());

  const interviewFlow = setupData.interviewFlow;
  const currentRoundConfig = interviewFlow?.rounds?.find((r: any) => r.round === state.currentRound);

  useEffect(() => {
    startInterview();
    const timer = setInterval(() => {
      setState(prev => ({
        ...prev,
        totalDuration: Math.floor((Date.now() - startTimeRef.current) / 1000)
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      // Generate first question using GPT-4o
      const response = await fetch('http://localhost:3000/api/interview/generate-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: setupData.company,
          role: setupData.role,
          round: state.currentRound,
          roundType: currentRoundConfig?.type,
          candidateProfile: setupData.candidateProfile
        }),
      });

      if (response.ok) {
      const data = await response.json();
        setState(prev => ({
          ...prev,
          currentQuestion: data.question
        }));
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = async () => {
    if (state.isRecording) {
      stopRecording();
      } else {
      startRecording();
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: mode === 'video' 
      });

      if (mode === 'video' && videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await processAudioData(event.data);
        }
      };

      mediaRecorder.start();
      setState(prev => ({ ...prev, isRecording: true, isListening: true }));

      // Start MediaPipe analysis if video mode
      if (mode === 'video') {
        startMediaPipeAnalysis();
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setState(prev => ({ ...prev, isRecording: false, isListening: false }));
  };

  const processAudioData = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('http://localhost:3000/api/interview/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          transcript: data.transcript
        }));

        // Generate AI response based on transcript
        await generateAIResponse(data.transcript);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const generateAIResponse = async (transcript: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/interview/ai-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript,
          currentQuestion: state.currentQuestion,
          round: state.currentRound,
          roundType: currentRoundConfig?.type,
          company: setupData.company,
          role: setupData.role
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.nextQuestion) {
          setState(prev => ({
            ...prev,
            currentQuestion: data.nextQuestion
          }));
        } else if (data.roundComplete) {
          await completeRound(data.score);
        }
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const completeRound = async (score: number) => {
    const newRoundScores = [...state.roundScores, score];
    setState(prev => ({
      ...prev,
      roundScores: newRoundScores
    }));

    if (state.currentRound < interviewFlow.rounds.length) {
      // Move to next round
      setState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        transcript: ''
      }));
      await startInterview();
    } else {
      // Interview complete
      await completeInterview(newRoundScores);
    }
  };

  const completeInterview = async (finalScores: number[]) => {
    try {
      const response = await fetch('http://localhost:3000/api/interview/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setupData,
          scores: finalScores,
          duration: state.totalDuration,
          mediaPipeData: state.mediaPipeData,
          transcript: state.transcript
        }),
      });

      if (response.ok) {
        const results = await response.json();
        onInterviewComplete(results);
      }
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  const startMediaPipeAnalysis = () => {
    // Simulate MediaPipe analysis for now
    const interval = setInterval(() => {
      if (state.isRecording) {
        setState(prev => ({
          ...prev,
          mediaPipeData: {
            eyeContact: Math.random() * 10,
            stress: Math.random() * 10,
            posture: Math.random() * 10,
            distraction: Math.random() * 10
          },
          confidence: Math.random() * 10
        }));
      } else {
        clearInterval(interval);
      }
    }, 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">
              {setupData.company} - {setupData.role}
          </h1>
            <p className="text-gray-400">
              Round {state.currentRound} of {interviewFlow?.rounds?.length || 1}
          </p>
        </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>{formatTime(state.totalDuration)}</span>
                </div>
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5" />
              <span>{state.confidence.toFixed(1)}/10</span>
                </div>
                </div>
              </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Video/Audio */}
          <div className="space-y-6">
            {/* Video/Audio Display */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {mode === 'video' ? 'Video Interview' : 'Voice Interview'}
                </h2>
                <div className="flex space-x-2">
                  {mode === 'video' && (
                <button
                      onClick={() => setState(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                      className={`p-2 rounded ${state.isRecording ? 'bg-red-500' : 'bg-gray-600'}`}
                    >
                      {state.isRecording ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                    </button>
                  )}
                <button
                    onClick={toggleRecording}
                    className={`p-2 rounded ${state.isRecording ? 'bg-red-500' : 'bg-blue-500'}`}
                >
                    {state.isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                </div>
              </div>

              {mode === 'video' && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 bg-gray-700 rounded"
                />
              )}

              {mode === 'voice' && (
                <div className="h-64 bg-gray-700 rounded flex items-center justify-center">
                  <div className="text-center">
                    <Mic className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-400">
                      {state.isRecording ? 'Recording...' : 'Click to start recording'}
                    </p>
              </div>
            </div>
              )}
          </div>

            {/* MediaPipe Analysis */}
            {mode === 'video' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Real-time Analysis
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-400">Eye Contact</span>
                    <div className="text-lg font-semibold">{state.mediaPipeData.eyeContact.toFixed(1)}/10</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Stress Level</span>
                    <div className="text-lg font-semibold">{state.mediaPipeData.stress.toFixed(1)}/10</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-400">Posture</span>
                    <div className="text-lg font-semibold">{state.mediaPipeData.posture.toFixed(1)}/10</div>
                </div>
                  <div>
                    <span className="text-sm text-gray-400">Focus</span>
                    <div className="text-lg font-semibold">{(10 - state.mediaPipeData.distraction).toFixed(1)}/10</div>
                  </div>
                </div>
              </div>
            )}
                    </div>

          {/* Right Column - Question & Code */}
          <div className="space-y-6">
            {/* Current Question */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                Current Question
              </h3>
              <div className="bg-gray-700 rounded p-4 min-h-32">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <p className="text-gray-200">{state.currentQuestion}</p>
                )}
                    </div>
                    </div>

            {/* Code Editor for Technical Rounds */}
            {currentRoundConfig?.questionType === 'coding' && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Code Editor
                </h3>
                <div className="h-64">
                  <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    theme="vs-dark"
                    value={state.codeOutput}
                    onChange={(value) => setState(prev => ({ ...prev, codeOutput: value || '' }))}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      wordWrap: 'on'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Your Response</h3>
              <div className="bg-gray-700 rounded p-4 min-h-32">
                {state.transcript ? (
                  <p className="text-gray-200">{state.transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    {state.isRecording ? 'Listening...' : 'Your response will appear here'}
                  </p>
                )}
                </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewExecution; 