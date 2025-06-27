
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function TransitionOverlay() {
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Start fading out almost immediately
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 50);

    // After animation is complete, mark as done to remove from DOM
    const doneTimer = setTimeout(() => {
      setIsDone(true);
    }, 1050); // Match duration + delay

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (isDone) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[999] transition-opacity duration-1000 ease-out pointer-events-none",
        "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.8)_70%,rgba(0,0,0,0.95)_100%)]",
        isFading ? "opacity-0" : "opacity-100"
      )}
    />
  );
}
