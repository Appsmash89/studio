
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface BonusIntroPopupProps {
    winningSegment: { label: string; };
    topSlotMultiplier: number;
    onComplete: () => void;
}

export function BonusIntroPopup({ winningSegment, topSlotMultiplier, onComplete }: BonusIntroPopupProps) {
    const [animationState, setAnimationState] = useState<'in' | 'out'>('in');

    useEffect(() => {
        // Start fade out after a delay
        const fadeOutTimer = setTimeout(() => {
            setAnimationState('out');
        }, 2500);

        // Complete the action after the fade-out completes (300ms animation)
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 2800);

        return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    const bonusName = winningSegment.label.replace('_', ' ');

    return (
        <div 
            className={cn(
                "fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300",
                animationState === 'in' ? 'opacity-100' : 'opacity-0'
            )}
        >
            <Card 
                className={cn(
                    "w-[360px] text-center transform transition-all duration-300",
                    animationState === 'in' ? 'animate-bounce-in' : 'animate-bounce-out'
                )}
            >
                <CardHeader>
                    <CardTitle className="text-3xl font-headline text-accent">
                        {bonusName}!
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-2">
                    <p className="text-lg text-muted-foreground">
                        Get ready for the bonus round!
                    </p>
                    {topSlotMultiplier > 1 && (
                        <div className="mt-2 flex items-center gap-2 rounded-lg bg-accent/20 p-2 text-accent animate-pulse">
                            <Sparkles className="h-6 w-6" />
                            <p className="text-xl font-bold">
                                {topSlotMultiplier}x Multiplier Active!
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
