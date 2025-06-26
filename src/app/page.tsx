'use client';

import dynamic from 'next/dynamic';
import { useAuth } from '@/contexts/auth-context';
import Login from '@/components/login';

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


export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Authenticating..." />;
  }

  if (!user) {
    return <Login />;
  }

  return <Game />;
}
