
'use client';

import React from 'react';

interface GameStatusDisplayProps {
    gameState: string;
    isPaused: boolean;
}

export const GameStatusDisplay: React.FC<GameStatusDisplayProps> = ({
    gameState,
    isPaused,
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
                return <h2 className="text-xl font-bold uppercase tracking-wider text-accent animate-pulse">Place Your Bets</h2>
            case 'SPINNING':
                 return <h2 className="text-2xl font-bold uppercase tracking-wider text-accent animate-pulse">No More Bets!</h2>
            case 'PRE_BONUS':
                return <h2 className="text-2xl font-bold uppercase tracking-wider text-accent animate-pulse">MULTIPLIER HIT!</h2>
            case 'RESULT':
                 return null;
            default:
                return null;
        }
    }

    return (
        <div className="h-24 flex flex-col items-center justify-center text-center gap-2">
            <div className="flex-grow flex items-center justify-center">
                {getDisplayMessage()}
            </div>
        </div>
    );
};
