// resume.ts - Simple Resume types
export interface ResumeImproveResponse {
  success: boolean;
  message: string;
  improvedResumeUrl?: string;
}

export interface ResumeStoreState {
  isUploading: boolean;
  error: string | null;
  successMessage: string | null;
  improvedResumeUrl: string | null;
  
  uploadAndImproveResume: (file: File, authToken?: string) => Promise<ResumeImproveResponse>;
  setError: (error: string | null) => void;
  clearMessages: () => void;
  reset: () => void;
}