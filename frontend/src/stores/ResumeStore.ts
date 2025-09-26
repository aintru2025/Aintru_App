// ResumeStore.ts - Simple Resume Store
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ResumeStoreState, ResumeImproveResponse } from './resume';

const API_BASE_URL = 'http://localhost:3000/api';

const useResumeStore = create<ResumeStoreState>()(
  devtools(
    (set) => ({
      isUploading: false,
      error: null,
      successMessage: null,
      improvedResumeUrl: null,

      uploadAndImproveResume: async (file: File, authToken?: string): Promise<ResumeImproveResponse> => {
        set({ isUploading: true, error: null, successMessage: null });

        try {
          // Validate file
          if (!file || file.type !== 'application/pdf') {
            throw new Error('Please upload a PDF file only');
          }

          // Create FormData
          const formData = new FormData();
          formData.append('resume', file);

          // Prepare headers
          const headers: Record<string, string> = {};
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }

          // API call
          const response = await fetch(`${API_BASE_URL}/resume/improve?mode=direct`, {
            method: 'POST',
            headers,
            body: formData
          });

          if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
          }

          // Check content type
          const contentType = response.headers.get('content-type');
          
          if (contentType && contentType.includes('application/pdf')) {
            // Direct PDF file received
            const blob = await response.blob();
            const improvedResumeUrl = URL.createObjectURL(blob);
            
            set({
              isUploading: false,
              improvedResumeUrl,
              successMessage: 'Resume improved successfully! Click download to get your improved resume.',
              error: null
            });

            return {
              success: true,
              message: 'Resume improved successfully!',
              improvedResumeUrl
            };
          } else {
            // JSON response expected
            const data: ResumeImproveResponse = await response.json();
            
            if (!data.success) {
              throw new Error(data.message || 'Resume improvement failed');
            }

            set({
              isUploading: false,
              improvedResumeUrl: data.improvedResumeUrl,
              successMessage: data.message || 'Resume improved successfully!',
              error: null
            });

            return data;
          }

        } catch (error: any) {
          const errorMessage = error.message || 'Upload failed';
          set({
            isUploading: false,
            error: errorMessage
          });
          throw error;
        }
      },

      setError: (error: string | null) => set({ error }),
      
      clearMessages: () => set({ error: null, successMessage: null }),
      
      reset: () => set({
        isUploading: false,
        error: null,
        successMessage: null,
        improvedResumeUrl: null
      })
    }),
    { name: 'resume-store' }
  )
);

export default useResumeStore;