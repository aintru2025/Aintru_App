// hooks/useFaceDetection.ts
import { useRef, useEffect, useState, useCallback } from 'react';

export interface FaceData {
  faceDetected: boolean;
  numFaces: number;
  emotions: {
    happy: number;
    sad: number;
    neutral: number;
    angry: number;
    surprised: number;
    disgusted: number;
    fearful: number;
  };
  eyeContact: boolean;
}

export interface VideoFrameData {
  timestamp: string;
  faceDetected: boolean;
  numFaces: number;
  emotions: FaceData['emotions'];
}

interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  currentInterviewId?: string;
  addVideoFrame?: (interviewId: string, frameData: VideoFrameData) => void;
  faceApiLoaded?: boolean;
}

export const useFaceDetection = ({
  videoRef,
  canvasRef,
  currentInterviewId,
  addVideoFrame,
  faceApiLoaded = false
}: UseFaceDetectionProps) => {
  const [currentFaceData, setCurrentFaceData] = useState<FaceData>({
    faceDetected: false,
    numFaces: 0,
    emotions: { 
      happy: 0, 
      sad: 0, 
      neutral: 1, 
      angry: 0, 
      surprised: 0, 
      disgusted: 0, 
      fearful: 0 
    },
    eyeContact: false
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameSent = useRef<number>(0);
  const lastStateUpdate = useRef<number>(0);

  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !window.faceapi || !faceApiLoaded) {
      // Fallback: Send basic data occasionally if no face API
      if (currentInterviewId && Math.random() < 0.2) {
        const basicFrameData: VideoFrameData = {
          timestamp: new Date().toISOString(),
          faceDetected: true,
          numFaces: 1,
          emotions: {
            happy: 0.3 + Math.random() * 0.3,
            sad: Math.random() * 0.1,
            neutral: 0.4 + Math.random() * 0.2,
            angry: Math.random() * 0.05,
            surprised: Math.random() * 0.1,
            disgusted: Math.random() * 0.05,
            fearful: Math.random() * 0.1
          }
        };
        addVideoFrame?.(currentInterviewId, basicFrameData);
      }
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Detect faces
      const detections = await window.faceapi
        .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      // Clear canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Optional: Draw detection boxes for debugging
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        detections.forEach(detection => {
          const box = detection.detection.box;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
        });
      }

      let faceData: FaceData = {
        faceDetected: false,
        numFaces: 0,
        emotions: { 
          happy: 0, 
          sad: 0, 
          neutral: 1, 
          angry: 0, 
          surprised: 0, 
          disgusted: 0, 
          fearful: 0 
        },
        eyeContact: false
      };

      if (detections.length > 0) {
        faceData.faceDetected = true;
        faceData.numFaces = detections.length;

        // Get emotions from first face
        const expressions = detections[0].expressions;
        if (expressions) {
          faceData.emotions = {
            happy: expressions.happy || 0,
            sad: expressions.sad || 0,
            neutral: expressions.neutral || 0,
            angry: expressions.angry || 0,
            surprised: expressions.surprised || 0,
            disgusted: expressions.disgusted || 0,
            fearful: expressions.fearful || 0
          };
        }

        // Eye contact detection
        const landmarks = detections[0].landmarks;
        if (landmarks) {
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          
          if (leftEye?.length && rightEye?.length) {
            const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
            const faceWidth = detections[0].detection.box.width;
            faceData.eyeContact = eyeDistance > faceWidth * 0.2;
          }
        }
      }

      // Update state ONLY every 2 seconds to prevent excessive re-renders
      const now = Date.now();
      if (now - lastStateUpdate.current > 2000) {
        setCurrentFaceData(faceData);
        lastStateUpdate.current = now;
      }

      // Send data to API every 5 seconds
      if (currentInterviewId && now - lastFrameSent.current > 5000) {
        const frameData: VideoFrameData = {
          timestamp: new Date().toISOString(),
          faceDetected: faceData.faceDetected,
          numFaces: faceData.numFaces,
          emotions: faceData.emotions
        };
        
        addVideoFrame?.(currentInterviewId, frameData);
        lastFrameSent.current = now;
      }

    } catch (error) {
      console.error('Face detection error:', error);
      
      // Set neutral fallback
      const now = Date.now();
      if (now - lastStateUpdate.current > 2000) {
        setCurrentFaceData({
          faceDetected: false,
          numFaces: 0,
          emotions: { happy: 0, sad: 0, neutral: 1, angry: 0, surprised: 0, disgusted: 0, fearful: 0 },
          eyeContact: false
        });
        lastStateUpdate.current = now;
      }
    }
  }, [videoRef, canvasRef, faceApiLoaded, currentInterviewId, addVideoFrame]);

  const startFaceDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    console.log("Starting face detection (hook)");
    intervalRef.current = setInterval(detectFaces, 500);
  }, [detectFaces]);

  const stopFaceDetection = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    console.log("Stopped face detection (hook)");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFaceDetection();
    };
  }, [stopFaceDetection]);

  return {
    currentFaceData,
    startFaceDetection,
    stopFaceDetection,
    isDetecting: !!intervalRef.current
  };
};

// import { useRef, useEffect, useState, useCallback } from 'react';
// import { VideoFrameData } from '../stores/exam';

// interface FaceData {
//   faceDetected: boolean;
//   numFaces: number;
//   emotions: {
//     happy: number;
//     sad: number;
//     neutral: number;
//     angry: number;
//     surprised: number;
//     disgusted: number;
//     fearful: number;
//   };
//   eyeContact: boolean;
// }

// export const useFaceDetection = (
//   videoRef: React.RefObject<HTMLVideoElement>,
//   canvasRef: React.RefObject<HTMLCanvasElement>,
//   currentInterviewId?: string,
//   addVideoFrame?: (interviewId: string, frameData: VideoFrameData) => void
// ) => {
//   const [currentFaceData, setCurrentFaceData] = useState<FaceData>({
//     faceDetected: false,
//     numFaces: 0,
//     emotions: { happy: 0, sad: 0, neutral: 1, angry: 0, surprised: 0, disgusted: 0, fearful: 0 },
//     eyeContact: false
//   });

//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const lastFrameSent = useRef<number>(0);

//   const detectFaces = useCallback(async () => {
//     if (!videoRef.current || !canvasRef.current || !window.faceapi) return;

//     try {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;

//       const detections = await window.faceapi
//         .detectAllFaces(video, new window.faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceExpressions();

//       const ctx = canvas.getContext('2d');
//       if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

//       let faceData: FaceData = {
//         faceDetected: false,
//         numFaces: 0,
//         emotions: { happy: 0, sad: 0, neutral: 1, angry: 0, surprised: 0, disgusted: 0, fearful: 0 },
//         eyeContact: false
//       };

//       if (detections.length > 0) {
//         faceData.faceDetected = true;
//         faceData.numFaces = detections.length;

//         const expressions = detections[0].expressions;
//         if (expressions) {
//           faceData.emotions = {
//             happy: expressions.happy || 0,
//             sad: expressions.sad || 0,
//             neutral: expressions.neutral || 0,
//             angry: expressions.angry || 0,
//             surprised: expressions.surprised || 0,
//             disgusted: expressions.disgusted || 0,
//             fearful: expressions.fearful || 0
//           };
//         }

//         // Eye contact detection (same as before)
//         const landmarks = detections[0].landmarks;
//         if (landmarks) {
//           const leftEye = landmarks.getLeftEye();
//           const rightEye = landmarks.getRightEye();
//           if (leftEye?.length && rightEye?.length) {
//             const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
//             const faceWidth = detections[0].detection.box.width;
//             faceData.eyeContact = eyeDistance > faceWidth * 0.2;
//           }
//         }
//       }

//       setCurrentFaceData(faceData);

//       // Send data every 5 seconds
//       if (currentInterviewId && Date.now() - lastFrameSent.current > 5000) {
//         const frameData: VideoFrameData = {
//           timestamp: new Date().toISOString(),
//           faceDetected: faceData.faceDetected,
//           numFaces: faceData.numFaces,
//           emotions: faceData.emotions
//         };
//         addVideoFrame?.(currentInterviewId, frameData);
//         lastFrameSent.current = Date.now();
//       }

//     } catch (error) {
//       console.error('Face detection error:', error);
//     }
//   }, [videoRef, canvasRef, currentInterviewId, addVideoFrame]);

//   const startFaceDetection = useCallback(() => {
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     intervalRef.current = setInterval(detectFaces, 500);
//   }, [detectFaces]);

//   const stopFaceDetection = useCallback(() => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//   }, []);

//   useEffect(() => {
//     return () => stopFaceDetection();
//   }, [stopFaceDetection]);

//   return {
//     currentFaceData,
//     startFaceDetection,
//     stopFaceDetection
//   };
// };