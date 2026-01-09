import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, AuthResponse, UserStatus } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  updateUserStatus: (userId: string, status: UserStatus) => Promise<void>;
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

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authService.login(email);
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
      handleAuthSuccess(response);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
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