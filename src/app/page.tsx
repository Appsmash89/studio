
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/auth-context';
import Login from '@/components/login';
import { AlertTriangle, DownloadCloud } from 'lucide-react';
import { assetManager } from '@/lib/asset-manager';
import { Progress } from '@/components/ui/progress';
import { collection, getDocs, query, limit, FirestoreError } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


const Game = dynamic(() => import('@/app/game') as Promise<React.ComponentType<{ assetUrls: Record<string, string> }>>, {
  ssr: false,
  loading: () => <LoadingScreen message="Loading Game..." />,
});

function LoadingScreen({ message, progress, isFirstLoad }: { message: string, progress?: number, isFirstLoad?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl sm:text-5xl font-headline text-accent tracking-wider text-center" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
        SpinRiches
      </h1>
      <div className="w-full max-w-sm flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center gap-2">
            <DownloadCloud className="w-6 h-6 animate-pulse" />
            <p className="text-xl animate-pulse">{message}</p>
        </div>
        {progress !== undefined && <Progress value={progress} className="w-full" />}
        {isFirstLoad && progress !== undefined && progress < 100 && (
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Subsequent loads will be much faster!
          </p>
        )}
      </div>
    </div>
  );
}

function FirebaseErrorScreen({ message }: { message:string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
             <div className="max-w-2xl text-center p-8 border-2 border-destructive rounded-lg bg-destructive/10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h1 className="text-2xl font-headline text-destructive-foreground mb-2">Firebase Configuration Error</h1>
                <p className="text-destructive-foreground/80">
                    The application could not connect to Firebase. Please check the following:
                </p>
                <pre className="mt-4 p-4 rounded-md bg-background/50 text-destructive-foreground text-left text-sm whitespace-pre-wrap">
                    {message}
                </pre>
                 <p className="mt-4 text-destructive-foreground/80">
                    You need to add your Firebase project's credentials to the <code className="bg-background/50 px-1 py-0.5 rounded">.env</code> file at the root of the project.
                </p>
            </div>
        </div>
    );
}

export default function Home() {
  const { user, loading: authLoading, error: firebaseError, isGuest, authError: authContextError } = useAuth();
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetUrls, setAssetUrls] = useState<Record<string, string> | null>(null);
  const [assetLoadingMessage, setAssetLoadingMessage] = useState("Initializing...");
  const [assetLoadProgress, setAssetLoadProgress] = useState(0);
  const [assetError, setAssetError] = useState<string | null>(null);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    const initializeAssets = async () => {
      try {
        setAssetLoadingMessage("Loading game assets...");
        
        const wasFreshLoad = await assetManager.init('/asset-manifest.json', (progress) => {
            setAssetLoadProgress(progress);
        });

        setIsFirstLoad(wasFreshLoad);
        
        const allUrls = await assetManager.getAllCachedUrls();
        setAssetUrls(allUrls);
        setAssetsReady(true);
        
      } catch (err: any) {
        console.error(err);
        setAssetError(`Could not load game assets: ${err.message}. Please check your internet connection and try again.`);
      }
    };

    initializeAssets();
  }, []);

  useEffect(() => {
    const fetchHighScores = async () => {
      if (!db) {
        console.log("Firestore not initialized, skipping fetch.");
        return;
      }
      try {
        console.log("Fetching high scores from Firestore...");
        const highScoresCol = collection(db, 'highscores');
        // --- OPTIMIZATION: Use query() and limit() to fetch only the top 10 documents ---
        const q = query(highScoresCol, limit(10));
        const querySnapshot = await getDocs(q);
        
        const highScores = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log('Fetched Top 10 High Scores:', highScores);
        if (querySnapshot.empty) {
          console.log('The "highscores" collection is empty or does not exist. This is expected if you have not added any data to it yet.');
        }
      } catch (error: any) {
        console.error("Error fetching high scores:", error);
        if (error.code === 'permission-denied' && !authContextError) {
          // This specific error is handled more gracefully in the AuthContext, 
          // so we don't need to show a generic error screen for it here.
          console.warn("Firestore permission denied for 'highscores' collection. This is likely due to security rules.");
        }
      }
    };

    fetchHighScores();
  }, [authContextError]);

  if (firebaseError) {
    return <FirebaseErrorScreen message={firebaseError} />;
  }

  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }
  
  if (assetError) {
      return (
         <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
             <Alert variant="destructive" className="max-w-xl">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Asset Loading Error</AlertTitle>
                <AlertDescription>{assetError}</AlertDescription>
            </Alert>
        </div>
      );
  }
  
  if (!assetsReady || !assetUrls) {
      return <LoadingScreen message={assetLoadingMessage} progress={assetLoadProgress} isFirstLoad={isFirstLoad} />;
  }

  if (!user && !isGuest) {
    return <Login />;
  }

  return (
    <>
      <Game assetUrls={assetUrls} />
    </>
  );
}
