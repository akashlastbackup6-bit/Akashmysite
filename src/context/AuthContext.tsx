import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import {
  getSessionUser,
  setSessionUser,
  signInEmailPassword,
  signUpEmailPassword,
  signInWithGoogle,
  logoutUser,
  saveUserProfile,
  subscribeDataChanges,
  auth,
  isFirebaseConfigured,
  isAdminEmail,
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  loginEmail: (email: string, pass: string) => Promise<UserProfile>;
  signupEmail: (email: string, pass: string, displayName: string) => Promise<UserProfile>;
  loginGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => getSessionUser());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Check if session user exists
    const current = getSessionUser();
    if (current) {
      setUser(current);
    }

    // Subscribe to internal state changes
    const unsubStorage = subscribeDataChanges(() => {
      setUser(getSessionUser());
    });

    // If live Firebase auth is enabled, listen to onAuthStateChanged
    let unsubAuth = () => {};
    if (auth && isFirebaseConfigured) {
      unsubAuth = onAuthStateChanged(auth, async fbUser => {
        if (!fbUser) {
          // If signed out in firebase
        }
      });
    }

    return () => {
      unsubStorage();
      unsubAuth();
    };
  }, []);

  const loginEmail = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await signInEmailPassword(email, pass);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const signupEmail = async (email: string, pass: string, displayName: string): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await signUpEmailPassword(email, pass, displayName);
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async (): Promise<UserProfile> => {
    setLoading(true);
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
      return profile;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<void> => {
    if (!user) return;
    const updated = { ...user, ...updates };
    await saveUserProfile(updated);
    setUser(updated);
  };

  const isAdmin = user?.role === 'admin' || isAdminEmail(user?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        loginEmail,
        signupEmail,
        loginGoogle,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
