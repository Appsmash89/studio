
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
    const prevSpinningRef = useRef(isSpinning);

    // Effect to set the initial/final position of the reel when not spinning.
    // This snaps the reel to the result position, in the middle of the duplicated list.
    useEffect(() => {
        if (isSpinning || result === null || !reelRef.current) return;
            
        const resultIndex = items.findIndex(item => String(item) === String(result));
        if (resultIndex === -1) return;
        
        const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
        const middleRevolution = Math.floor(duplicatedItems.length / items.length / 2);
        const targetOffset = (middleRevolution * singleRevolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);

        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
    }, [result, items, isSpinning, duplicatedItems.length]);
    
    // Effect to handle the start and stop of the spinning animation
    useEffect(() => {
        if (!reelRef.current) return;

        const wasSpinning = prevSpinningRef.current;
        const singleRevolutionHeight = items.length * REEL_ITEM_HEIGHT;
        const reelElement = reelRef.current;

        const handleTransitionEnd = () => {
            if (!reelElement) return;
            reelElement.style.transition = 'none';
            
            const currentTransform = getComputedStyle(reelElement).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;
            
            const middleRevolution = Math.floor(duplicatedItems.length / items.length / 2);
            const middleOfStripOffset = middleRevolution * singleRevolutionHeight;

            // Reset position to the equivalent spot in the middle of the strip
            // to prevent transform value from growing too large.
            const newY = -(middleOfStripOffset + (Math.abs(currentY) % singleRevolutionHeight));

            reelElement.style.transform = `translateY(${newY}px)`;
        };

        if (isSpinning && !wasSpinning) {
            // START SPINNING
            // Clean up any previous listener to prevent premature reset
            reelElement.removeEventListener('transitionend', handleTransitionEnd);
            
            const currentTransform = getComputedStyle(reelElement).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;

            reelElement.style.transition = `transform ${spinDuration}s linear`;
            
            const spinRevolutions = 15 + reelIndex * 5; // Spin faster and longer
            const finalOffset = currentY - (singleRevolutionHeight * spinRevolutions);
            
            reelElement.style.transform = `translateY(${finalOffset}px)`;
        } else if (!isSpinning && wasSpinning) {
            // STOP SPINNING
            if (result === null) return;
            
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;

            const currentTransform = getComputedStyle(reelElement).transform;
            const matrix = new DOMMatrixReadOnly(currentTransform);
            const currentY = matrix.m42;

            const currentRevolutionOffset = Math.abs(currentY) % singleRevolutionHeight;
            const targetRevolutionOffset = resultIndex * REEL_ITEM_HEIGHT;
            
            const distanceToNextResult = (singleRevolutionHeight - currentRevolutionOffset) + targetRevolutionOffset;
            
            const finalOffset = currentY - distanceToNextResult;
            
            reelElement.style.transition = `transform ${1 + reelIndex * 0.25}s cubic-bezier(0.25, 1, 0.5, 1)`;
            reelElement.style.transform = `translateY(${finalOffset}px)`;
            
            reelElement.addEventListener('transitionend', handleTransitionEnd, { once: true });
        }

        prevSpinningRef.current = isSpinning;

        return () => {
            reelElement.removeEventListener('transitionend', handleTransitionEnd);
        };
    }, [isSpinning, result, items, duplicatedItems.length, spinDuration, reelIndex]);


    return (
        <div className="w-1/2 h-full overflow-hidden">
            <div
                ref={reelRef}
                className="flex flex-col transform-gpu" // Added transform-gpu to hint at hardware acceleration
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
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        </div>
    );
};
