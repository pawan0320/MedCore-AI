import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthResponse, UserStatus } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
  updateUserContext: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUserFromStorage = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken && authService.verifyToken(storedToken)) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    } else {
      authService.logout();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  // Handle Dark Mode Side Effect
  useEffect(() => {
    if (user?.preferences?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferences?.darkMode]);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login(email, password);
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.register(data);
      if (response.token) {
        handleAuthSuccess(response);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserContext = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = await authService.updateUserProfile(user.id, updates);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const handleAuthSuccess = (response: AuthResponse) => {
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem('token', response.token);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    document.documentElement.classList.remove('dark');
  };

  // Helper for Admin updates to reflect immediately in UI if needed (mock)
  const updateUserStatus = async (userId: string, status: UserStatus) => {
     await authService.updateUserStatus(userId, status);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isAuthenticated: !!user, 
      login, 
      register,
      logout,
      updateUserStatus,
      updateUserContext,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};