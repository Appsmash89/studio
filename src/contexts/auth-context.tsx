'use client';

import type { User } from 'firebase/auth';
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, firebaseError } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  error: string | null;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsGuest(false);
        setAuthError(null);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInError = (error: any) => {
    // These errors are safe to ignore as they happen when the user closes the popup.
    if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
      return;
    }

    console.error('Sign-In Error:', error);
    if (error.code === 'auth/unauthorized-domain') {
        setAuthError('auth/unauthorized-domain');
    } else {
        setAuthError(error.message);
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) return;
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      handleSignInError(error);
    }
  };

  const signInWithGitHub = async () => {
    if (!auth) return;
    setAuthError(null);
    const provider = new GithubAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      handleSignInError(error);
    }
  };

  const signInAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setAuthError(null);
  };

  const signOut = async () => {
    setIsGuest(false);
    if (!auth) return;
    setAuthError(null);
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign-Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isGuest, signInWithGoogle, signInWithGitHub, signOut, signInAsGuest, error: firebaseError, authError }}
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
