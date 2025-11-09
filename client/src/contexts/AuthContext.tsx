import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/api';
import api from '../api/api';

interface User {
  id: string;
  email: string;
  name: string;
  username: string; // For display purposes, same as name
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  register: (email: string, password: string, name: string, verificationCode: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize - verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('coldaw_token');
      if (storedToken) {
        try {
          // Set token to axios header
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Verify token and get user info
          const userData = await authApi.verifyToken();
          setUser({
            id: userData.userId,
            email: userData.email,
            name: userData.name,
            username: userData.name, // Use name as username
          });
          setToken(storedToken);
        } catch (error) {
          console.error('Token validation failed:', error);
          localStorage.removeItem('coldaw_token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      // Save token
      localStorage.setItem('coldaw_token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      // Set user info
      setUser({
        id: response.userId,
        email: response.email,
        name: response.name,
        username: response.name, // Use name as username
      });
      setToken(response.token);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      throw new Error(message);
    }
  };

  const sendVerificationCode = async (email: string) => {
    try {
      await authApi.sendVerificationCode(email);
    } catch (error) {
      console.error('Failed to send verification code:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string, verificationCode: string) => {
    try {
      const response = await authApi.register(email, password, name, verificationCode);
      
      // Auto login after registration
      localStorage.setItem('coldaw_token', response.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
      
      setUser({
        id: response.userId,
        email: response.email,
        name: response.name,
        username: response.name, // Use name as username
      });
      setToken(response.token);
    } catch (error: any) {
      const message = error.response?.data?.error || 'Registration failed';
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local state anyway
      localStorage.removeItem('coldaw_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        login,
        sendVerificationCode,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
