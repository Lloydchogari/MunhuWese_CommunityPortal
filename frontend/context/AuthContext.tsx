'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { API_BASE } from '@/lib/config';

interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  role: 'user' | 'admin';
  profileImage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  // Accept (user, token) to match the rest of the app calls like login(data.user, data.token)
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthLoading: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true); // 1. Start in a loading state

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await fetch(`${API_BASE}/auth/me`, { // An endpoint to get the current user
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            setToken(storedToken);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
        }
      }
      // 2. Set loading to false after the check is complete
      setIsAuthLoading(false);
    };

    validateSession();
  }, []);

  const login = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // 3. Provide the new state through the context
  const value = { user, token, login, logout, isAuthLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};