
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';

export const TOP_SLOT_LEFT_REEL_ITEMS = ['1', '2', '5', '10', 'COIN_FLIP', 'PACHINKO', 'CASH_HUNT', 'CRAZY_TIME'];
export const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];
const REEL_ITEM_HEIGHT = 80; // h-20 in tailwind

const Reel = ({ items, result, isSpinning }: { items: (string | number)[], result: string | number | null, isSpinning: boolean }) => {
    const duplicatedItems = useMemo(() => [...items, ...items, ...items, ...items], [items]);
    const reelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!reelRef.current) return;
        
        if (isSpinning) {
            // Start spinning animation
            reelRef.current.style.transition = 'none';
            reelRef.current.classList.add('animate-top-slot-spin');
            const randomOffset = Math.floor(Math.random() * items.length) * REEL_ITEM_HEIGHT;
            // We set a random starting point to make it look different each time
            reelRef.current.style.transform = `translateY(-${randomOffset}px)`;
        } else {
            // Stop spinning animation
            reelRef.current.classList.remove('animate-top-slot-spin');
            if (result !== null) {
                const resultIndex = items.findIndex(item => String(item).replace(' ', '_') === String(result).replace(' ', '_'));
                // Position to land on the second set of items for a smoother "slow down" effect
                const targetIndex = items.length + (resultIndex >= 0 ? resultIndex : 0);
                const targetOffset = targetIndex * REEL_ITEM_HEIGHT;
                // Animate to the final position
                reelRef.current.style.transition = 'transform 3s ease-out';
                reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
            }
        }
    }, [isSpinning, result, items]);

    return (
        <div className="w-1/2 h-full overflow-hidden">
            <div
                ref={reelRef}
                className={cn("flex flex-col")}
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
        <div className="relative w-80 h-24 bg-gradient-to-br from-purple-900 via-slate-800 to-purple-900 rounded-xl border-4 border-yellow-400 shadow-2xl flex items-center justify-center p-1 gap-1 z-20">
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
            <div className="w-full h-full flex gap-1 bg-black/50 rounded-md relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/50" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-20 border-y-2 border-yellow-500/70 bg-white/5 pointer-events-none" />
                
                <Reel items={TOP_SLOT_LEFT_REEL_ITEMS} result={isSpinning ? null : result?.left ?? null} isSpinning={isSpinning} />
                <Reel items={TOP_SLOT_RIGHT_REEL_ITEMS} result={isSpinning ? null : result?.right ?? null} isSpinning={isSpinning} />
            </div>
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
        </div>
    );
};
