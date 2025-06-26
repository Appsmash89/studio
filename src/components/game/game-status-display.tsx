
'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import type { AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import type { SEGMENTS_CONFIG } from '@/config/game-config';


interface GameStatusDisplayProps {
    gameState: string;
    isPaused: boolean;
    winningSegment: (typeof SEGMENTS_CONFIG)[0] | null;
    aiMessage: AiEncouragementOutput | null;
}

export const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
    gameState,
    isPaused,
    winningSegment,
    aiMessage,
}) => {

    const aiMessageColor = {
        low: 'text-muted-foreground',
        medium: 'text-foreground',
        high: 'text-accent',
    };

    return (
        <div className="h-32 flex flex-col items-center justify-center text-center gap-4">
            <div className="flex-grow flex items-center justify-center">
                {gameState === 'BETTING' && (
                    <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
                        {isPaused ? 'GAME PAUSED' : 'Place Your Bets'}
                    </h2>
                )}
                {gameState === 'SPINNING' && (
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-accent animate-pulse">
                        No More Bets!
                    </h2>
                )}
                {gameState === 'RESULT' && winningSegment && (
                    <>
                        <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">
                            {isPaused ? 'GAME PAUSED' : 'Winner is...'}
                        </h2>
                        <p className="text-4xl font-headline text-accent">{winningSegment.label.replace('_', ' ')}</p>
                    </>
                )}
            </div>
            {aiMessage && gameState === 'RESULT' && (
                <Card className={cn("bg-card/50 backdrop-blur-sm border-accent/30 p-3 transition-all duration-500 flex-shrink-0", gameState === 'SPINNING' ? "opacity-0" : "opacity-100")}>
                    <CardContent className="p-0 flex items-center gap-3">
                        <Sparkles className="text-accent w-5 h-5" />
                        <p className={cn("text-base", aiMessageColor[aiMessage.encouragementLevel])}>
                            {aiMessage.message}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
