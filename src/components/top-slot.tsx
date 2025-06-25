
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
    const duplicatedItems = useMemo(() => [...items, ...items, ...items, ...items], [items]);
    const reelRef = useRef<HTMLDivElement>(null);
    const currentOffset = useRef(0);
    const prevSpinningRef = useRef(isSpinning);

    // Effect to set the initial/final position of the reel when not spinning
    useEffect(() => {
        if (!isSpinning && result !== null && reelRef.current) {
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;
            
            // Set position to the 2nd set of items for seamless looping
            const targetIndex = items.length + resultIndex;
            const targetOffset = targetIndex * REEL_ITEM_HEIGHT;

            reelRef.current.style.transition = 'none'; // Snap to position without animation
            reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
            currentOffset.current = -targetOffset;
        }
    }, [result, items, isSpinning, duplicatedItems.length]);
    

    // Effect to handle the start and stop of the spinning animation
    useEffect(() => {
        if (!reelRef.current) return;

        const wasSpinning = prevSpinningRef.current;
        
        if (isSpinning && !wasSpinning) {
            // START SPINNING
            const spinRevolutions = 10 + reelIndex * 2; // More spin for the right reel
            const spinDistance = duplicatedItems.length * REEL_ITEM_HEIGHT * spinRevolutions;
            
            reelRef.current.style.transition = `transform ${spinDuration}s linear`;
            const newTransform = currentOffset.current - spinDistance;
            reelRef.current.style.transform = `translateY(${newTransform}px)`;

        } else if (!isSpinning && wasSpinning) {
            // STOP SPINNING
            if (result === null) return;
            
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;

            // Get the current transform value to calculate the closest stop point
            const currentTransform = getComputedStyle(reelRef.current).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;

            const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
            const currentRevolutions = Math.abs(Math.ceil(currentY / singleRevolutionHeight));

            const targetIndex = items.length + resultIndex; // Land on the 2nd set of items
            const finalOffset = (currentRevolutions * singleRevolutionHeight) + (targetIndex * REEL_ITEM_HEIGHT);

            currentOffset.current = -finalOffset;

            reelRef.current.style.transition = `transform ${1.5 + reelIndex * 0.5}s cubic-bezier(0.25, 1, 0.5, 1)`;
            reelRef.current.style.transform = `translateY(-${finalOffset}px)`;
        }

        prevSpinningRef.current = isSpinning;
    }, [isSpinning, result, items, duplicatedItems.length, spinDuration, reelIndex]);

    return (
        <div className="w-1/2 h-full overflow-hidden">
            <div
                ref={reelRef}
                className="flex flex-col"
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
                    spinDuration={3}
                    reelIndex={0}
                />
                <Reel 
                    items={TOP_SLOT_RIGHT_REEL_ITEMS} 
                    result={result?.right ?? null} 
                    isSpinning={isSpinning}
                    spinDuration={3.5}
                    reelIndex={1}
                />
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
        </div>
    );
};
