
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/auth-context';
import Login from '@/components/login';
import { AlertTriangle, DownloadCloud } from 'lucide-react';
import { assetManager } from '@/lib/asset-manager';
import { Progress } from '@/components/ui/progress';

const Game = dynamic(() => import('@/app/game') as Promise<React.ComponentType<{ assetUrls: Record<string, string> }>>, {
  ssr: false,
  loading: () => <LoadingScreen message="Loading Game..." />,
});

function LoadingScreen({ message, progress }: { message: string, progress?: number }) {
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
  const { user, loading: authLoading, error: firebaseError, isGuest } = useAuth();
  const [assetsReady, setAssetsReady] = useState(false);
  const [assetUrls, setAssetUrls] = useState<Record<string, string> | null>(null);
  const [assetLoadingMessage, setAssetLoadingMessage] = useState("Initializing...");
  const [assetLoadProgress, setAssetLoadProgress] = useState(0);
  const [assetError, setAssetError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAssets = async () => {
      try {
        setAssetLoadingMessage("Loading game assets...");
        
        // init will now download ALL assets and report progress
        await assetManager.init('/asset-manifest.json', (progress) => {
            setAssetLoadProgress(progress);
        });
        
        // Get URLs for all the assets that are now cached
        const allUrls = await assetManager.getAllCachedUrls();
        setAssetUrls(allUrls);
        setAssetsReady(true); // Render the game now that everything is ready
        
      } catch (err) {
        console.error(err);
        setAssetError("Could not load game assets. Please check your internet connection and try again.");
      }
    };

    initializeAssets();
  }, []);

  if (firebaseError) {
    return <FirebaseErrorScreen message={firebaseError} />;
  }

  if (authLoading) {
    return <LoadingScreen message="Authenticating..." />;
  }
  
  if (assetError) {
      return <FirebaseErrorScreen message={assetError} />;
  }
  
  // Show the loading screen until all assets are downloaded and their URLs are ready.
  if (!assetsReady || !assetUrls) {
      return <LoadingScreen message={assetLoadingMessage} progress={assetLoadProgress} />;
  }

  if (!user && !isGuest) {
    return <Login />;
  }

  return <Game assetUrls={assetUrls} />;
}
