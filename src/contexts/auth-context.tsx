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
import { getUserData, createInitialUserData, saveUserData } from '@/lib/user-data-service';
import type { UserData } from '@/types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  balance: number;
  setBalance: React.Dispatch<React.SetStateAction<number>>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
  error: string | null;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_DEFAULT_BALANCE = 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [balance, setBalance] = useState(GUEST_DEFAULT_BALANCE);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setIsGuest(false);
        setAuthError(null);
        let userData = await getUserData(user.uid);
        if (!userData) {
          userData = await createInitialUserData(user.uid);
        }
        setBalance(userData.balance);
      } else {
        // User is not logged in (or is a guest)
        setBalance(GUEST_DEFAULT_BALANCE);
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInError = (error: any) => {
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
    if (user) {
      signOut();
    }
    setIsGuest(true);
    setUser(null);
    setAuthError(null);
    setBalance(GUEST_DEFAULT_BALANCE);
  };

  const signOut = async () => {
    if (isGuest) {
        setIsGuest(false);
        return;
    }
    
    if (!auth || !user) return;
    
    setAuthError(null);
    try {
      // Save data before signing out
      await saveUserData(user.uid, { balance, lastLogin: new Date().toISOString() });
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign-Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isGuest, signInWithGoogle, signInWithGitHub, signOut, signInAsGuest, error: firebaseError, authError, balance, setBalance }}
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
