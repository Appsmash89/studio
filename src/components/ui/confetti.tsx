
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const CONFETTI_COUNT = 50;

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-4))',
];

interface ConfettiPiece {
  id: number;
  style: React.CSSProperties;
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const xStart = 45 + Math.random() * 10;
      const yStart = 45 + Math.random() * 10;
      const xEnd = xStart + (Math.random() - 0.5) * 200;
      const yEnd = yStart + (Math.random() - 0.5) * 200;

      return {
        id: i,
        style: {
          '--x-start': `${xStart}vw`,
          '--y-start': `${yStart}vh`,
          '--x-end': `${xEnd}vw`,
          '--y-end': `${yEnd}vh`,
          '--rotation-start': `${Math.random() * 360}deg`,
          '--rotation-end': `${Math.random() * 1080}deg`,
          'animationDelay': `${Math.random() * 0.2}s`,
          backgroundColor: COLORS[i % COLORS.length],
        } as React.CSSProperties,
      };
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute h-2.5 w-1.5 animate-confetti-blast rounded-[50%]"
          style={piece.style}
        />
      ))}
    </div>
  );
}
