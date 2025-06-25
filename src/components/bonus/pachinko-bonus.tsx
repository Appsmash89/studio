
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number, details?: any) => void;
}

const INITIAL_SLOTS: (number | 'DOUBLE')[] = [5, 10, 15, 'DOUBLE', 25, 'DOUBLE', 15, 10, 5];
const MAX_MULTIPLIER = 10000;
const NUM_PEGS_ROWS = 8;
const PEGS_PER_ROW = 9;

// Generate a random path for the puck
const generatePath = (targetSlotIndex: number) => {
    let path = [{ x: 50, y: -5 }]; // Start above the board
    let currentX = 50;

    // A more realistic path generation
    for (let i = 0; i < NUM_PEGS_ROWS; i++) {
        // Move left or right
        const randomDirection = Math.random() < 0.5 ? -1 : 1;
        // Adjust horizontal movement based on row
        const xMove = (100 / PEGS_PER_ROW / 2) * randomDirection;
        currentX += xMove;
        
        // Add some vertical randomness
        const yPos = (i + 1) * (100 / (NUM_PEGS_ROWS + 2));
        path.push({ x: currentX, y: yPos });
    }
    
    // Final destination into the slot
    const finalX = (targetSlotIndex / (INITIAL_SLOTS.length -1)) * (100 - (100 / INITIAL_SLOTS.length)) + (100 / INITIAL_SLOTS.length / 2);
    path.push({ x: finalX, y: 100 });

    return `M ${path[0].x},${path[0].y} ${path.slice(1).map(p => `L ${p.x},${p.y}`).join(' ')}`;
};

export function PachinkoBonus({ betAmount, onComplete }: BonusGameProps) {
    const [gameState, setGameState] = useState<'ready' | 'dropping' | 'doubling' | 'result'>('ready');
    const [multipliers, setMultipliers] = useState<(number | 'DOUBLE')[]>(INITIAL_SLOTS);
    const [winnings, setWinnings] = useState(0);
    const [finalMultiplier, setFinalMultiplier] = useState<number | null>(null);
    const [dropHistory, setDropHistory] = useState<(number | 'DOUBLE')[]>([]);
    const [isCompleted, setIsCompleted] = useState(false);
    const [animationPath, setAnimationPath] = useState('');
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const [puckKey, setPuckKey] = useState(0);

    useEffect(() => {
        if (gameState !== 'dropping' && gameState !== 'doubling') return;

        let timer: NodeJS.Timeout;

        if (gameState === 'dropping') {
            // Deactivate any previous blinking slot
            setActiveSlot(null);

            const dropIndex = Math.floor(Math.random() * multipliers.length);
            const result = multipliers[dropIndex];
            
            setDropHistory(prev => [...prev, result]);
            setAnimationPath(generatePath(dropIndex));
            setPuckKey(prev => prev + 1); // Remount the puck to restart animation

            timer = setTimeout(() => {
                // Activate the slot after the puck has landed
                setActiveSlot(dropIndex);

                if (result === 'DOUBLE') {
                    setGameState('doubling');
                } else {
                    const winningMultiplier = result as number;
                    const finalWinnings = betAmount * winningMultiplier;
                    setWinnings(finalWinnings);
                    setFinalMultiplier(winningMultiplier);
                    setGameState('result');
                }
            }, 2500); // Wait for animation to finish
        } else if (gameState === 'doubling') {
            // The 'DOUBLE' slot is already blinking.
            // Update multipliers after a pause, then re-drop.
            setMultipliers(prevMultipliers => 
                prevMultipliers.map(m =>
                    typeof m === 'number' ? Math.min(m * 2, MAX_MULTIPLIER) : 'DOUBLE'
                )
            );

            timer = setTimeout(() => {
                setGameState('dropping'); // Re-drop the puck. The 'dropping' state will handle resetting the active slot.
            }, 1500); // Pause to show new values and "DOUBLE" message
        }

        return () => clearTimeout(timer);
    }, [gameState, betAmount, multipliers]);


    const handleDrop = () => {
        if (gameState !== 'ready') return;
        setGameState('dropping');
    };


    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        onComplete(winnings, { 
            pachinkoDropHistory: dropHistory,
            pachinkoFinalMultipliers: multipliers 
        });
    };
    
    const Pegs = useMemo(() => {
        const pegElements = [];
        for (let row = 0; row < NUM_PEGS_ROWS; row++) {
            const isOffset = row % 2 !== 0;
            const numPegsInRow = isOffset ? PEGS_PER_ROW -1 : PEGS_PER_ROW;
            for (let col = 0; col < numPegsInRow; col++) {
                const x = (isOffset ? (col + 1) * (100 / (numPegsInRow + 1)) : (col + 0.5) * (100 / numPegsInRow)) + (Math.random() - 0.5) * 2;
                const y = (row + 1) * (100 / (NUM_PEGS_ROWS + 2)) + (Math.random() - 0.5) * 2;
                pegElements.push(
                    <div
                        key={`${row}-${col}`}
                        className="absolute w-2 h-2 bg-slate-300 rounded-full -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%`, boxShadow: '0 0 5px rgba(255,255,255,0.5)' }}
                    />
                );
            }
        }
        return pegElements;
    }, []);

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <CardTitle className="text-center text-accent">Pachinko Bonus!</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                   
                    <div className="h-16 flex flex-col justify-center">
                        {gameState === 'ready' && (
                            <>
                                <p>You bet ${betAmount.toLocaleString()} on Pachinko.</p>
                                <p className="text-muted-foreground text-center">Click below to drop the puck!</p>
                            </>
                        )}

                        {gameState === 'dropping' && (
                            <p className="text-xl font-bold text-accent animate-pulse">
                               Dropping...
                            </p>
                        )}
                        
                        {gameState === 'doubling' && (
                            <p className="text-xl font-bold text-accent animate-pulse">
                               DOUBLE! Re-dropping...
                            </p>
                        )}

                        {gameState === 'result' && finalMultiplier !== null && (
                            <div className="text-center animate-in fade-in zoom-in-50">
                                <p className="text-xl font-semibold">You won with a {finalMultiplier}x multiplier!</p>
                                <p className="text-4xl font-bold text-accent my-1">Prize: ${winnings.toLocaleString()}!</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="relative w-full aspect-[4/5] bg-primary/10 rounded-lg border-2 border-accent/50 overflow-hidden">
                        <div className="relative w-full h-[85%]">
                            {Pegs}
                            {gameState === 'dropping' && (
                                <svg
                                  className="absolute inset-0 w-full h-full"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                >
                                    <path d={animationPath} fill="none" stroke="none" id="puck-path" />
                                    <circle r="3" fill="hsl(var(--accent))" stroke="white" strokeWidth="1" key={puckKey}>
                                        <animateMotion dur="2.5s" begin="0s" fill="freeze" repeatCount="1">
                                            <mpath href="#puck-path" />
                                        </animateMotion>
                                    </circle>
                                </svg>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 h-[15%] flex justify-evenly items-center border-t-2 border-accent/50 bg-background/30">
                           {multipliers.map((slot, index) => (
                                <div key={index} className={cn(
                                    "w-12 h-10 flex items-center justify-center rounded-md font-bold text-sm transition-all duration-300",
                                    slot === 'DOUBLE' ? 'bg-purple-600 text-white' : 'bg-green-600 text-white',
                                    'shadow-inner',
                                    activeSlot === index && 'animate-pulse ring-4 ring-white'
                                )}>
                                    {slot === 'DOUBLE' ? slot : `${slot}x`}
                                </div>
                            ))}
                        </div>
                    </div>

                    {gameState === 'ready' && (
                         <Button onClick={handleDrop} disabled={isCompleted}>
                            <ArrowDown className="mr-2 h-4 w-4"/>
                            Drop Puck
                        </Button>
                    )}

                    {gameState === 'result' && (
                         <Button onClick={handleComplete} disabled={isCompleted} className="mt-4">
                            Continue
                         </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
