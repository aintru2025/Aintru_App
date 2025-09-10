import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  getToken: () => string | null;
  initializeAuth: () => void;
  validateToken: (token: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  login: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ isAuthenticated: true, user, token });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ isAuthenticated: false, user: null, token: null });
  },
  getToken: () => {
    return get().token || localStorage.getItem('token');
  },
  validateToken: async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.log('❌ Token validation failed:', error);
      return false;
    }
  },
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    console.log('🔐 Initializing auth...', { hasToken: !!token, hasUser: !!userStr });
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        
        // Validate token with backend
        const isValid = await get().validateToken(token);
        console.log('🔑 Token validation result:', isValid);
        
        if (isValid) {
          set({ isAuthenticated: true, user, token });
          console.log('✅ Auth initialized successfully');
        } else {
          // Token is invalid, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ isAuthenticated: false, user: null, token: null });
          console.log('❌ Invalid token, cleared auth state');
        }
      } catch (error) {
        // Invalid user data, clear everything
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ isAuthenticated: false, user: null, token: null });
        console.log('❌ Invalid user data, cleared auth state');
      }
    } else {
      set({ isAuthenticated: false, user: null, token: null });
      console.log('❌ No stored auth data');
    }
  },
}));