
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface NumberResultPopupProps {
    winningSegment: { label: string; multiplier: number; };
    onComplete: () => void;
    customTextureUrl?: string;
    totalWinnings: number;
    topSlotMultiplier: number;
}

export function NumberResultPopup({ winningSegment, onComplete, customTextureUrl, totalWinnings, topSlotMultiplier }: NumberResultPopupProps) {
    const [animationState, setAnimationState] = useState<'in' | 'out'>('in');

    useEffect(() => {
        const fadeOutTimer = setTimeout(() => {
            setAnimationState('out');
        }, 2500);

        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2800);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const containerStyle: React.CSSProperties = {};
    if (customTextureUrl) {
        containerStyle.backgroundImage = `url(${customTextureUrl})`;
        containerStyle.backgroundSize = 'contain';
        containerStyle.backgroundRepeat = 'no-repeat';
        containerStyle.backgroundPosition = 'center';
    }

    return (
        <div 
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300",
                animationState === 'in' ? 'opacity-100' : 'opacity-0'
            )}
        >
             <div
                className={cn(
                    "w-[280px] text-center transform transition-all duration-300",
                    animationState === 'in' ? 'animate-bounce-in' : 'animate-bounce-out'
                )}
            >
                {customTextureUrl ? (
                     <div className="w-full h-96" style={containerStyle} />
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline text-accent">
                                You Won on {winningSegment.label}!
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-2">
                             {topSlotMultiplier > 1 && (
                                <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent/20 p-2 text-accent animate-pulse">
                                    <Sparkles className="h-5 w-5" />
                                    <p className="text-lg font-bold">
                                        Top Slot Multiplier: {topSlotMultiplier}x
                                    </p>
                                </div>
                            )}
                            <p className="text-4xl font-bold mt-2">
                                ${totalWinnings.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
}
