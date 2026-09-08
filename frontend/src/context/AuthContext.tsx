import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api, hasAccessToken } from '../services/api';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrNim: string, password: string) => Promise<User>;
  register: (
    userData: Omit<User, 'id' | 'status' | 'joinedDate'>,
    password: string,
  ) => Promise<User>;
  logout: () => void;
  updateProfile: (updated: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasAccessToken()) {
      setIsLoading(false);
      return;
    }

    api.auth
      .getCurrentUser()
      .then(async (curr) => {
        await StorageService.bootstrap();
        StorageService.setCurrentUser(curr);
        setUser(curr);
      })
      .catch(() => {
        api.auth.logout();
        StorageService.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (emailOrNim: string, password: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await api.auth.login(emailOrNim, password);
      await StorageService.bootstrap();
      StorageService.setCurrentUser(loggedUser);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    userData: Omit<User, 'id' | 'status' | 'joinedDate'>,
    password: string,
  ) => {
    setIsLoading(true);
    try {
      const registeredUser = await api.auth.register(userData, password);
      await StorageService.bootstrap();
      StorageService.setCurrentUser(registeredUser);
      setUser(registeredUser);
      return registeredUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    StorageService.clear();
    setUser(null);
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const merged: User = { ...user, ...updated };
    const saved = await api.auth.updateUser(merged);
    StorageService.setCurrentUser(saved);
    setUser(saved);
  };

  const role: UserRole = user?.role || 'student';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
