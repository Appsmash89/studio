
'use client';

import { useEffect, useMemo, useRef } from 'react';

export const TOP_SLOT_LEFT_REEL_ITEMS = ['1', '2', '5', '10', 'COIN_FLIP', 'PACHINKO', 'CASH_HUNT', 'CRAZY_TIME'];
export const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];
const REEL_ITEM_HEIGHT = 80; // h-20 in tailwind

interface ReelProps {
    items: (string | number)[];
    result: string | number | null;
    isSpinning: boolean;
    spinDuration: number; // in seconds
    reelIndex: number;
}

const Reel = ({ items, result, isSpinning, spinDuration, reelIndex }: ReelProps) => {
    const duplicatedItems = useMemo(() => Array.from({ length: 20 }).flatMap(() => items), [items]);
    const reelRef = useRef<HTMLDivElement>(null);

    // Effect to set the initial position before any spinning
    useEffect(() => {
        if (!reelRef.current || !result) return;
        const resultIndex = items.findIndex(item => String(item) === String(result));
        if (resultIndex === -1) return;

        const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
        // Start in the middle of the duplicated list
        const middleRevolution = Math.floor(duplicatedItems.length / items.length / 2);
        const targetOffset = (middleRevolution * singleRevolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);

        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only once on mount

    // Effect to handle the spinning animation
    useEffect(() => {
        if (!reelRef.current) return;

        if (isSpinning) {
            // Start spinning
            const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
            const spinRevolutions = 10; // A fixed number of revolutions
            // We find the current position based on the transform property
            const currentTransform = getComputedStyle(reelRef.current).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;
            
            const finalOffset = currentY - (singleRevolutionHeight * spinRevolutions);
            
            reelRef.current.style.transition = `transform ${spinDuration}s linear`;
            reelRef.current.style.transform = `translateY(${finalOffset}px)`;
        } else {
            // Stop spinning at the result
            if (result === null) return;
            
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;

            const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
            // Target a position in a different middle of the duplicated list to ensure transition happens
            const middleRevolution = Math.floor(duplicatedItems.length / items.length / 4);
            const targetOffset = (middleRevolution * singleRevolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);

            reelRef.current.style.transition = `transform ${1 + reelIndex * 0.5}s cubic-bezier(0.25, 1, 0.5, 1)`;
            reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSpinning]);


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
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            <div className="w-full h-full flex gap-1 bg-black/50 rounded-md relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/50" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-20 border-y-2 border-yellow-500/70 bg-white/5 pointer-events-none" />
                
                <Reel 
                    items={TOP_SLOT_LEFT_REEL_ITEMS} 
                    result={result?.left ?? null} 
                    isSpinning={isSpinning}
                    spinDuration={2.5}
                    reelIndex={1}
                />
                <Reel 
                    items={TOP_SLOT_RIGHT_REEL_ITEMS} 
                    result={result?.right ?? null} 
                    isSpinning={isSpinning}
                    spinDuration={2}
                    reelIndex={0}
                />
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
        </div>
    );
};
