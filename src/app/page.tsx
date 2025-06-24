'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/app/game'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-6xl font-headline text-accent tracking-wider" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
        SpinRiches
      </h1>
      <p className="mt-4 text-xl animate-pulse">Loading Game...</p>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
