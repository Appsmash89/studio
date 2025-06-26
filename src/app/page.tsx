'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/auth-context';
import Login from '@/components/login';
import { AlertTriangle } from 'lucide-react';

const Game = dynamic(() => import('@/app/game'), {
  ssr: false,
  loading: () => <LoadingScreen message="Loading Game..." />,
});

function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl sm:text-5xl font-headline text-accent tracking-wider text-center" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
        Wheel of Fortune Casino – Free Spins
      </h1>
      <p className="mt-4 text-xl animate-pulse">{message}</p>
    </div>
  );
}

function FirebaseErrorScreen({ message }: { message: string }) {
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
  const { user, loading, error } = useAuth();

  if (error) {
    return <FirebaseErrorScreen message={error} />;
  }

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!user) {
    return <Login />;
  }

  return <Game />;
}
