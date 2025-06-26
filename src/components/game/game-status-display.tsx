'use client';

import React from 'react';
import type { SEGMENTS_CONFIG } from '@/config/game-config';


interface GameStatusDisplayProps {
    gameState: string;
    isPaused: boolean;
    winningSegment: (typeof SEGMENTS_CONFIG)[0] | null;
}

export const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
    gameState,
    isPaused,
    winningSegment,
}) => {

    const getDisplayMessage = () => {
        if (isPaused) {
            return <h2 className="text-xl font-bold uppercase tracking-wider text-accent animate-pulse">GAME PAUSED</h2>
        }
        if (gameState === 'NUMBER_RESULT') {
            return null;
        }
        switch(gameState) {
            case 'BETTING':
                return <h2 className="text-xl font-bold uppercase tracking-wider text-accent">Place Your Bets</h2>
            case 'SPINNING':
                 return <h2 className="text-2xl font-bold uppercase tracking-wider text-accent animate-pulse">No More Bets!</h2>
            case 'RESULT':
                 return null;
            default:
                return null;
        }
    }

    return (
        <div className="h-32 flex flex-col items-center justify-center text-center gap-2">
            <div className="flex-grow flex items-center justify-center">
                {getDisplayMessage()}
            </div>
        </div>
    );
};
