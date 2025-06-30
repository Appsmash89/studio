// src/lib/user-data-service.ts
'use client';

import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserData } from '@/types/user';

const INITIAL_BALANCE = 1000;

/**
 * Fetches a user's data from the 'users' collection in Firestore.
 * @param userId - The UID of the user.
 * @returns A promise that resolves to the user's data, or null if not found.
 */
export const getUserData = async (userId: string): Promise<UserData | null> => {
  if (!db) return null;
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserData;
  } else {
    return null;
  }
};

/**
 * Saves or updates a user's data in Firestore.
 * @param userId - The UID of the user.
 * @param data - The data to save. It can be a partial object.
 * @returns A promise that resolves when the data has been written.
 */
export const saveUserData = async (userId: string, data: Partial<UserData>): Promise<void> => {
  if (!db) return;
  const userDocRef = doc(db, 'users', userId);
  await setDoc(userDocRef, data, { merge: true });
};


/**
 * Creates an initial data document for a new user in Firestore.
 * @param userId - The UID of the new user.
 * @returns A promise that resolves to the newly created user data.
 */
export const createInitialUserData = async (userId: string): Promise<UserData> => {
    const newUserData: UserData = {
        balance: INITIAL_BALANCE,
        lastLogin: new Date().toISOString(),
    };
    await saveUserData(userId, newUserData);
    return newUserData;
}
