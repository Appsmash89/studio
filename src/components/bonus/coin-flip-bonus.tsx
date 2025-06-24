
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Progress } from "@/components/ui/progress"
import { Sparkles } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number) => void;
}

const MULTIPLIERS = [2, 3, 4, 5, 10, 15, 20, 25, 50, 100];
const CHOICE_TIME_SECONDS = 5;

export function CoinFlipBonus({ betAmount, onComplete }: BonusGameProps) {
    const [phase, setPhase] = useState<'generating' | 'choosing' | 'flipping' | 'result'>('generating');
    const [multipliers, setMultipliers] = useState<{ red: number; blue: number } | null>(null);
    const [countdown, setCountdown] = useState(CHOICE_TIME_SECONDS);
    const [userChoice, setUserChoice] = useState<'red' | 'blue' | null>(null);
    const [flipResult, setFlipResult] = useState<'red' | 'blue' | null>(null);
    const [winnings, setWinnings] = useState(0);

    // Phase 1: Generate multipliers
    useEffect(() => {
        if (phase === 'generating') {
            const shuffled = [...MULTIPLIERS].sort(() => 0.5 - Math.random());
            setTimeout(() => {
                setMultipliers({ red: shuffled[0], blue: shuffled[1] });
                setPhase('choosing');
            }, 1000); // A small delay to show the intro text
        }
    }, [phase]);

    const startFlip = useCallback(() => {
        setPhase('flipping');
        const result = Math.random() < 0.5 ? 'red' : 'blue';

        setTimeout(() => {
            setFlipResult(result);
            const chosenSide = userChoice || (Math.random() < 0.5 ? 'red' : 'blue');
            if (userChoice === null) setUserChoice(chosenSide); // show the auto-picked choice

            let finalWinnings = 0;
            if (result === chosenSide && multipliers) {
                finalWinnings = betAmount * (result === 'red' ? multipliers.red : multipliers.blue);
            }
            setWinnings(finalWinnings);
            setPhase('result');
        }, 3000); // 3-second flip animation
    }, [userChoice, betAmount, multipliers]);

    // Phase 2: Handle countdown for user choice
    useEffect(() => {
        if (phase !== 'choosing') return;

        if (countdown <= 0) {
            startFlip();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [phase, countdown, startFlip]);

    const handleChoice = (choice: 'red' | 'blue') => {
        if (phase === 'choosing') {
            setUserChoice(choice);
            setCountdown(0); // This will trigger the useEffect to start the flip
        }
    };

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

                    {phase === 'choosing' && multipliers && (
                        <div className="w-full flex flex-col items-center gap-4 animate-in fade-in">
                            <p className="text-lg font-semibold">Choose a side!</p>
                            <div className="flex justify-around w-full">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-red-800">
                                        {multipliers.red}x
                                    </div>
                                    <Button onClick={() => handleChoice('red')} variant="destructive">Choose Red</Button>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-blue-800">
                                        {multipliers.blue}x
                                    </div>
                                    <Button onClick={() => handleChoice('blue')}>Choose Blue</Button>
                                </div>
                            </div>
                            <div className="w-full mt-4">
                                <p className="text-2xl font-bold">{countdown}</p>
                                <Progress value={(countdown / CHOICE_TIME_SECONDS) * 100} className="w-full mt-2" />
                            </div>
                        </div>
                    )}

                    {phase === 'flipping' && (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-xl font-bold animate-pulse">Flipping...</p>
                            <div className="w-32 h-32 [perspective:1000px]">
                                <div className="relative w-full h-full [transform-style:preserve-3d] animate-flip">
                                    <div className="absolute w-full h-full rounded-full bg-blue-600 [backface-visibility:hidden] flex items-center justify-center text-4xl text-white font-bold">?</div>
                                    <div className="absolute w-full h-full rounded-full bg-red-600 [backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center text-4xl text-white font-bold">?</div>
                                d</div>
                            </div>
                        </div>
                    )}

                    {phase === 'result' && flipResult && multipliers && (
                         <div className="flex flex-col items-center gap-4 animate-in zoom-in-50">
                             <p className="text-xl font-semibold">The result is...</p>
                             <div className={cn(
                                "w-32 h-32 rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-lg",
                                flipResult === 'red' ? 'bg-red-600 border-4 border-red-800' : 'bg-blue-600 border-4 border-blue-800'
                             )}>
                                 {flipResult === 'red' ? `${multipliers.red}x` : `${multipliers.blue}x`}
                             </div>
                             {winnings > 0 ? (
                                <>
                                    <p className="text-2xl font-bold text-accent">You Won!</p>
                                    <p className="text-lg">Your Bet: ${betAmount.toLocaleString()}</p>
                                    <p className="text-lg">Your Choice: <span className={cn('font-bold', userChoice === 'red' ? 'text-red-500' : 'text-blue-500')}>{userChoice}</span></p>
                                    <p className="text-3xl font-bold">Total Win: ${winnings.toLocaleString()}</p>
                                </>
                             ) : (
                                <p className="text-2xl font-bold text-muted-foreground">So close! Better luck next time.</p>
                             )}
                             <Button onClick={() => onComplete(winnings)} className="mt-4">Continue</Button>
                         </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
