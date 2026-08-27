import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';
import { StorageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (emailOrNim: string, role?: string) => Promise<User>;
  logout: () => void;
  switchRoleUser: (userId: string) => Promise<void>;
  updateProfile: (updated: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    StorageService.initDefaults();
    api.auth
      .getCurrentUser()
      .then((curr) => {
        setUser(curr);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (emailOrNim: string, role?: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await api.auth.login(emailOrNim, role);
      setUser(loggedUser);
      return loggedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // For demo purposes, we can switch back to public or default student
    const defaultUser = StorageService.getUsers()[0];
    StorageService.setCurrentUser(defaultUser);
    setUser(defaultUser);
  };

  const switchRoleUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const switched = await api.auth.switchUser(userId);
      setUser(switched);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<User>) => {
    if (!user) return;
    const merged: User = { ...user, ...updated };
    const saved = await api.auth.updateUser(merged);
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
        logout,
        switchRoleUser,
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
