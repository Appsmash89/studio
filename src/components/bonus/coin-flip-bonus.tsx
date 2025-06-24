
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number) => void;
}

const MULTIPLIERS = [2, 3, 4, 5, 10, 15, 20, 25, 50, 100];

export function CoinFlipBonus({ betAmount, onComplete }: BonusGameProps) {
    const [phase, setPhase] = useState<'generating' | 'show_multipliers' | 'flipping' | 'result'>('generating');
    const [multipliers, setMultipliers] = useState<{ red: number; blue: number } | null>(null);
    const [flipResult, setFlipResult] = useState<'red' | 'blue' | null>(null);
    const [winnings, setWinnings] = useState(0);

    // Game flow handler
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (phase === 'generating') {
            const shuffled = [...MULTIPLIERS].sort(() => 0.5 - Math.random());
            timer = setTimeout(() => {
                setMultipliers({ red: shuffled[0], blue: shuffled[1] });
                setPhase('show_multipliers');
            }, 1500); // Delay to show "Generating..."
        }
        
        if (phase === 'show_multipliers') {
            timer = setTimeout(() => {
                setPhase('flipping');
            }, 2500); // Show multipliers for 2.5 seconds
        }
        
        if (phase === 'flipping' && multipliers) {
            const result = Math.random() < 0.5 ? 'red' : 'blue';
            timer = setTimeout(() => {
                setFlipResult(result);
                const winningMultiplier = result === 'red' ? multipliers.red : multipliers.blue;
                const finalWinnings = betAmount * winningMultiplier;
                setWinnings(finalWinnings);
                setPhase('result');
            }, 3000); // 3-second flip animation
        }

        return () => clearTimeout(timer);
    }, [phase, multipliers, betAmount]);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in">
            <Card className="w-[380px] sm:w-[450px] text-center overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-center text-accent">Coin Flip Bonus!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 min-h-[300px] justify-center">

                    {phase === 'generating' && (
                        <div className="animate-in fade-in">
                            <p className="text-xl font-bold">Generating Multipliers...</p>
                            <Sparkles className="w-12 h-12 text-accent mx-auto mt-4 animate-pulse"/>
                        </div>
                    )}

                    {phase === 'show_multipliers' && multipliers && (
                        <div className="w-full flex flex-col items-center gap-4 animate-in fade-in">
                            <p className="text-lg font-semibold">The multipliers are set!</p>
                            <div className="flex justify-around w-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-red-800">
                                        {multipliers.red}x
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-blue-800">
                                        {multipliers.blue}x
                                    </div>
                                </div>
                            </div>
                            <p className="text-lg font-semibold mt-4 animate-pulse">Get ready to flip!</p>
                        </div>
                    )}

                    {phase === 'flipping' && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xl font-bold animate-pulse">Flipping...</p>
                            <div className="w-32 h-32 [perspective:1000px]">
                                <div className="relative w-full h-full [transform-style:preserve-3d] animate-flip">
                                    <div className="absolute w-full h-full rounded-full bg-blue-600 [backface-visibility:hidden] flex items-center justify-center text-4xl text-white font-bold">?</div>
                                    <div className="absolute w-full h-full rounded-full bg-red-600 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center text-4xl text-white font-bold">?</div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {phase === 'result' && flipResult && multipliers && (
                         <div className="flex flex-col items-center gap-4 animate-in zoom-in-50">
                             <p className="text-xl font-semibold">The winning side is...</p>
                             <div className={cn(
                                "w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg",
                                flipResult === 'red' ? 'bg-red-600 border-4 border-red-800' : 'bg-blue-600 border-4 border-blue-800'
                             )}>
                                 {flipResult === 'red' ? `${multipliers.red}x` : `${multipliers.blue}x`}
                             </div>
                             <p className="text-2xl font-bold text-accent">You Won!</p>
                             <p className="text-lg">Your Bet: ${betAmount.toLocaleString()}</p>
                             <p className="text-3xl font-bold">Total Win: ${winnings.toLocaleString()}</p>
                             <Button onClick={() => onComplete(winnings)} className="mt-4">Continue</Button>
                         </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
