
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Star, Heart, Spade, Club, Diamond, Gift, Cake, Bird, Shuffle } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number, details?: any) => void;
}

// Generate 108 multipliers with a specific distribution
const generateMultipliers = (): number[] => {
    const multipliers = [
        // High-tier
        100, 75, 50, 50,
        // Mid-tier
        ...Array(10).fill(25),
        ...Array(14).fill(20),
        ...Array(20).fill(15),
        // Low-tier
        ...Array(20).fill(10),
        ...Array(20).fill(7),
        ...Array(20).fill(5),
    ]; // Total = 4 + 10 + 14 + 20 + 20 + 20 + 20 = 108
    return multipliers;
};

const iconComponents = [Star, Heart, Spade, Club, Diamond, Gift, Cake, Bird];

const getRandomIcon = () => {
    const Icon = iconComponents[Math.floor(Math.random() * iconComponents.length)];
    return <Icon className="w-6 h-6" />;
};


export function CashHuntBonus({ betAmount, onComplete }: BonusGameProps) {
    const [gameState, setGameState] = useState<'picking' | 'revealed'>('picking');
    const [multipliers, setMultipliers] = useState<number[]>([]);
    const [symbols, setSymbols] = useState<JSX.Element[]>([]);
    const [winnings, setWinnings] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const shuffleBoard = () => {
        // Shuffle multipliers
        const shuffledMultipliers = [...generateMultipliers()].sort(() => Math.random() - 0.5);
        setMultipliers(shuffledMultipliers);

        // Assign random symbols
        const newSymbols = Array.from({ length: 108 }, () => getRandomIcon());
        setSymbols(newSymbols);
    };

    useEffect(() => {
        shuffleBoard();
    }, []);

    const handleSelect = (index: number) => {
        if (gameState !== 'picking') return;

        const selectedMultiplier = multipliers[index];
        const finalWinnings = betAmount * selectedMultiplier;

        setSelectedIndex(index);
        setWinnings(finalWinnings);
        setGameState('revealed');
    };

    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        onComplete(winnings, { cashHuntMultipliers: multipliers });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-accent">Cash Hunt Bonus!</CardTitle>
                     {gameState === 'picking' && <Button onClick={shuffleBoard} variant="outline" size="sm"><Shuffle className="mr-2 h-4 w-4"/>Shuffle Symbols</Button>}
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center gap-4 overflow-hidden">
                    {gameState === 'picking' ? (
                         <p className="text-lg font-semibold text-center">Pick a symbol to reveal your multiplier!</p>
                    ) : (
                        <div className="text-center animate-in fade-in zoom-in-50">
                            <p className="text-xl font-semibold">You picked a {multipliers[selectedIndex!]}x multiplier!</p>
                            <p className="text-4xl font-bold text-accent my-2">You Won ${winnings.toLocaleString()}!</p>
                            <Button onClick={handleComplete} disabled={isCompleted} className="mt-2">Continue</Button>
                        </div>
                    )}
                   
                    <div className="w-full flex-grow overflow-y-auto pr-2">
                        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                            {symbols.map((symbol, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSelect(index)}
                                    disabled={gameState === 'revealed'}
                                    className={cn(
                                        'aspect-square rounded-md flex items-center justify-center transition-all duration-300',
                                        'text-foreground bg-primary/20 hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed',
                                        'transform hover:scale-110 disabled:transform-none',
                                        gameState === 'revealed' && 'bg-background/20',
                                        selectedIndex === index && 'bg-accent text-accent-foreground scale-110 ring-4 ring-accent-foreground',
                                        gameState === 'revealed' && selectedIndex !== index && 'opacity-50'
                                    )}
                                >
                                    <div className="flex flex-col items-center justify-center text-center">
                                        {gameState === 'revealed' ? (
                                            <span className="text-lg font-bold">{multipliers[index]}x</span>
                                        ) : (
                                            symbol
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
