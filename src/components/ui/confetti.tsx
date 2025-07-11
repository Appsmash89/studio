
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const CONFETTI_COUNT = 70;

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
      const xStart = 40 + Math.random() * 20; // Start horizontally centered
      const yStart = 40 + Math.random() * 20; // Start vertically centered
      
      // Blast coordinates (peak of the arc)
      const xBlast = xStart + (Math.random() - 0.5) * 150;
      const yBlast = yStart - (Math.random() * 50 + 50); // Blast upwards

      // Final fall coordinates
      const xEnd = xBlast + (Math.random() - 0.5) * 100;
      const yEnd = 110; // Fall off the bottom of the screen

      return {
        id: i,
        style: {
          '--x-start': `${xStart}vw`,
          '--y-start': `${yStart}vh`,
          '--x-blast': `${xBlast}vw`,
          '--y-blast': `${yBlast}vh`,
          '--x-end': `${xEnd}vw`,
          '--y-end': `${yEnd}vh`,
          '--rotation-start': `${Math.random() * 360}deg`,
          '--rotation-end': `${Math.random() * 1080 + 360}deg`,
          'animationDelay': `${Math.random() * 0.3}s`,
          'animationDuration': `${1.5 + Math.random() * 1}s`,
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
          className="absolute h-2.5 w-1.5 animate-confetti-blast rounded-sm"
          style={piece.style}
        />
      ))}
    </div>
  );
}
