import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// A simple check to see if the environment variables are loaded.
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    // If the variables are missing, it's likely the .env file wasn't loaded.
    // This can happen if the development server wasn't restarted after creating the file.
    // Or if the variables are missing from the deployment environment.
    // We throw an error with a more helpful message.
    throw new Error(
        'Firebase configuration is missing. ' +
        'Please ensure you have a `.env` file with the correct Firebase credentials. ' +
        'If you just created the file, you may need to restart your development server.'
    );
}


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
