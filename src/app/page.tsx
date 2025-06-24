'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/app/game'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <h1 className="text-4xl sm:text-5xl font-headline text-accent tracking-wider text-center" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
        Wheel of Fortune Casino – Free Spins
      </h1>
      <p className="mt-4 text-xl animate-pulse">Loading Game...</p>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}
