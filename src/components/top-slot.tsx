
'use client';

import { useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { TOP_SLOT_LEFT_REEL_ITEMS, TOP_SLOT_RIGHT_REEL_ITEMS } from '@/config/game-config';

const REEL_ITEM_HEIGHT = 80; // h-20 in tailwind

interface ReelProps {
    items: (string | number)[];
    result: string | number | null;
    isSpinning: boolean;
    reelIndex: number;
    customTextures: Record<string, string>;
    type: 'left' | 'right';
    hideText: boolean;
}

const Reel = ({ items, result, isSpinning, reelIndex, customTextures, type, hideText }: ReelProps) => {
    // Duplicate items to ensure the list is long enough for a seamless wrap-around illusion.
    const duplicatedItems = useMemo(() => Array.from({ length: 20 }).flatMap(() => items), [items]);
    const reelRef = useRef<HTMLDivElement>(null);

    // This effect runs whenever the state changes.
    useEffect(() => {
        if (!reelRef.current) return;

        // Set initial position without animation.
        const setInitialPosition = () => {
            if (result === null) return;
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) return;
            
            const startRevolution = 10;
            const targetOffset = (startRevolution * items.length * REEL_ITEM_HEIGHT) + (resultIndex * REEL_ITEM_HEIGHT);
            
            reelRef.current!.style.transition = 'none';
            reelRef.current!.style.transform = `translateY(-${targetOffset}px)`;
        };

        if (isSpinning) {
            // When isSpinning becomes true, perform the spin animation.
            const resultIndex = items.findIndex(item => String(item) === String(result));
            if (resultIndex === -1) {
                setInitialPosition();
                return;
            };

            const currentTransform = window.getComputedStyle(reelRef.current).transform;
            const matrix = new DOMMatrix(currentTransform);
            const currentY = matrix.m42;
            
            const revolutions = 4;
            const revolutionHeight = items.length * REEL_ITEM_HEIGHT;
            
            // To ensure it always spins forward, we need to find the next valid stop position from the current one.
            const numRevolutionsToSpin = revolutions + Math.ceil(Math.abs(currentY) / revolutionHeight);
            const targetY = (numRevolutionsToSpin * revolutionHeight) + (resultIndex * REEL_ITEM_HEIGHT);
            
            reelRef.current.style.transition = `transform ${2.5 + reelIndex * 0.5}s cubic-bezier(0.33, 1, 0.68, 1)`;
            reelRef.current.style.transform = `translateY(-${targetY}px)`;
            
            // After spinning, reset to a new "start" position to prevent translateY from getting too large.
            const resetTimeout = setTimeout(() => {
                setInitialPosition();
            }, (2500 + reelIndex * 500) + 100);

            return () => clearTimeout(resetTimeout);

        } else {
            // When not spinning, just set the position instantly.
            setInitialPosition();
        }

    }, [isSpinning, result, items, reelIndex]);


    return (
        <div className="w-1/2 h-full overflow-hidden [transform:translateZ(0)]">
            <div
                ref={reelRef}
                className="flex flex-col"
            >
                {duplicatedItems.map((item, i) => {
                    const textureKey = type === 'right' ? `topslot-right-${item}x` : `topslot-left-${String(item)}`;
                    const customTexture = customTextures[textureKey];
                    
                    const style: React.CSSProperties = {
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                    };

                    if (customTexture) {
                        style.backgroundImage = `url(${customTexture})`;
                        style.backgroundSize = 'cover';
                        style.backgroundPosition = 'center';
                        style.color = 'transparent';
                    }

                    return (
                        <div key={i} 
                            className={cn(
                                "h-20 flex-shrink-0 flex items-center justify-center text-xl font-bold text-white uppercase text-center leading-tight tracking-wider",
                                (customTexture && hideText) && 'text-transparent'
                            )} 
                            style={style}>
                            {typeof item === 'string' ? item.replace('_', '\n') : `${item}x`}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const TopSlot = ({ result, isSpinning, customTextures, hideText }: { result: { left: string | null; right: number | null } | null, isSpinning: boolean, customTextures: Record<string, string>, hideText: boolean }) => {
    const backgroundTexture = customTextures['topslot-background'];
    
    const containerStyle: React.CSSProperties = {};
    if (backgroundTexture) {
        containerStyle.backgroundImage = `url(${backgroundTexture})`;
        containerStyle.backgroundSize = 'cover';
        containerStyle.backgroundPosition = 'center';
    }

    return (
        <div 
            className={cn(
                "relative w-80 h-24 rounded-xl border-4 border-yellow-400 shadow-2xl flex items-center justify-center p-1",
                !backgroundTexture && "bg-gradient-to-br from-purple-900 via-slate-800 to-purple-900"
            )}
            style={containerStyle}
        >
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)' }} />
            <div className="w-full h-full flex gap-1 bg-black/50 rounded-md relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/50" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-20 border-y-2 border-yellow-500/70 bg-white/5 pointer-events-none" />
                
                <Reel 
                    items={TOP_SLOT_LEFT_REEL_ITEMS} 
                    result={result?.left ?? null} 
                    isSpinning={isSpinning}
                    reelIndex={1}
                    customTextures={customTextures}
                    type="left"
                    hideText={hideText}
                />
                <Reel 
                    items={TOP_SLOT_RIGHT_REEL_ITEMS} 
                    result={result?.right ?? null} 
                    isSpinning={isSpinning}
                    reelIndex={0}
                    customTextures={customTextures}
                    type="right"
                    hideText={hideText}
                />
            </div>
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg z-10" style={{ clipPath: 'polygon(100% 0%, 0% 50%, 100% 100%)' }} />
        </div>
    );
};

    
