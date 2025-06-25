
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

export const TOP_SLOT_LEFT_REEL_ITEMS = ['1', '2', '5', '10', 'COIN_FLIP', 'PACHINKO', 'CASH_HUNT', 'CRAZY_TIME'];
export const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];
const REEL_ITEM_HEIGHT = 80; // h-20 in tailwind

interface ReelProps {
    items: (string | number)[];
    result: string | number | null;
    isSpinning: boolean;
    reelIndex: number;
}

const Reel = ({ items, result, isSpinning, reelIndex }: ReelProps) => {
    // Duplicate items to ensure the list is long enough for a seamless wrap-around illusion.
    const duplicatedItems = useMemo(() => Array.from({ length: 20 }).flatMap(() => items), [items]);
    const reelRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    // This effect runs whenever the state changes.
    useEffect(() => {
        if (!reelRef.current) return;

        // On initial mount, or when resetting between spins, snap to the result position without animation.
        if (isInitialMount.current || !isSpinning) {
            isInitialMount.current = false;
            if (result === null) return;
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;

            const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
            // Start in a "middle" revolution to allow spinning up or down and prevent transform values from getting too large.
            const startRevolution = 10;
            const targetOffset = (startRevolution * singleRevolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);
            
            reelRef.current.style.transition = 'none';
            reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
            return;
        }

        // When isSpinning becomes true, perform the spin animation.
        if (isSpinning) {
            if (result === null) return;
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;

            const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
            const spinRevolutions = 8;
            
            // Get current position to calculate a new target that is revolutions away.
            const currentTransform = window.getComputedStyle(reelRef.current).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;
            const currentPosition = -currentY;
            
            const currentRevolution = Math.floor(currentPosition / singleRevolutionHeight);
            // The target revolution is far away to ensure a long spin.
            const targetRevolution = currentRevolution + spinRevolutions;
            
            const finalPosition = (targetRevolution * singleRevolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);
            
            // Staggered stop duration
            const duration = 2.5 + reelIndex * 0.5;

            reelRef.current.style.transition = `transform ${duration}s cubic-bezier(0.25, 0.1, 0.25, 1)`;
            reelRef.current.style.transform = `translateY(-${finalPosition}px)`;
        }

    // isSpinning and result are the key dependencies that should trigger this effect.
    }, [isSpinning, result]);


    return (
        <div className="w-1/2 h-full overflow-hidden">
            <div
                ref={reelRef}
                className="flex flex-col transform-gpu"
            >
                {duplicatedItems.map((item, i) => (
                    <div key={i} className="h-20 flex-shrink-0 flex items-center justify-center text-xl font-bold text-white uppercase text-center leading-tight tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                        {typeof item === 'string' ? item.replace('_', '\n') : `${item}x`}
                    </div>
                ))}
            </div>
        </div>
    );
};


export const TopSlot = ({ result, isSpinning }: { result: { left: string | null; right: number | null } | null, isSpinning: boolean }) => {
    return (
        <div className="relative w-80 h-24 bg-gradient-to-br from-purple-900 via-slate-800 to-purple-900 rounded-xl border-4 border-yellow-400 shadow-2xl flex items-center justify-center p-1">
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
            <div className="w-full h-full flex gap-1 bg-black/50 rounded-md relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/50" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-20 border-y-2 border-yellow-500/70 bg-white/5 pointer-events-none" />
                
                <Reel 
                    items={TOP_SLOT_LEFT_REEL_ITEMS} 
                    result={result?.left ?? null} 
                    isSpinning={isSpinning}
                    reelIndex={1}
                />
                <Reel 
                    items={TOP_SLOT_RIGHT_REEL_ITEMS} 
                    result={result?.right ?? null} 
                    isSpinning={isSpinning}
                    reelIndex={0}
                />
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        </div>
    );
};
