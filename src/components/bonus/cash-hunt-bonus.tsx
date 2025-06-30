
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Star, Heart, Spade, Club, Diamond, Gift, Cake, Bird } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number, details?: any) => void;
    topSlotMultiplier: number;
}

const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const generateMultipliers = (): number[] => {
    const multipliers = [
        100, 75, 50, 50,
        ...Array(10).fill(25),
        ...Array(14).fill(20),
        ...Array(20).fill(15),
        ...Array(20).fill(10),
        ...Array(20).fill(7),
        ...Array(20).fill(5),
    ];
    return multipliers;
};

const iconComponents = [Star, Heart, Spade, Club, Diamond, Gift, Cake, Bird];

const getRandomIcon = () => {
    const Icon = iconComponents[Math.floor(Math.random() * iconComponents.length)];
    return <Icon className="w-6 h-6" />;
};

type GridItem = {
    id: number;
    displayMultiplier: number;
    finalMultiplier: number;
    symbol: JSX.Element;
    isFlipped: boolean;
    introAnimated: boolean;
};

export function CashHuntBonus({ betAmount, onComplete, topSlotMultiplier = 1 }: BonusGameProps) {
    const [gameState, setGameState] = useState<'intro' | 'shuffling' | 'picking' | 'revealed'>('intro');
    const [gridItems, setGridItems] = useState<GridItem[]>([]);
    const [winnings, setWinnings] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [activeColumn, setActiveColumn] = useState<number | null>(null);

    const animationTimeoutRef = useRef<NodeJS.Timeout>();
    const shuffleIntervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const finalMultipliers = shuffleArray(generateMultipliers());
        const initialMultipliers = shuffleArray(generateMultipliers());
        const symbols = Array.from({ length: 108 }, () => getRandomIcon());

        const initialGrid = Array.from({ length: 108 }, (_, i) => ({
            id: i,
            displayMultiplier: initialMultipliers[i],
            finalMultiplier: finalMultipliers[i],
            symbol: symbols[i],
            isFlipped: false,
            introAnimated: false,
        }));
        setGridItems(initialGrid);

        const slideInTimer = setTimeout(() => {
            setGridItems(prev => prev.map(item => ({ ...item, introAnimated: true })));
        }, 100);

        const flipTimer = setTimeout(() => {
            setGridItems(prev => prev.map(item => ({ ...item, isFlipped: true })));
        }, 2000);

        const startShuffleTimer = setTimeout(() => {
            setGameState('shuffling');
        }, 2600);

        return () => {
            clearTimeout(slideInTimer);
            clearTimeout(flipTimer);
            clearTimeout(startShuffleTimer);
        };
    }, []);

    useEffect(() => {
        if (gameState !== 'shuffling') {
            if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
            return;
        }

        let shuffleCount = 0;
        const maxShuffles = 8; // ~1.5 seconds

        shuffleIntervalRef.current = setInterval(() => {
            setGridItems(prev => shuffleArray(prev));
            shuffleCount++;
            if (shuffleCount >= maxShuffles) {
                clearInterval(shuffleIntervalRef.current);
                setGameState('picking');
            }
        }, 180);

        return () => {
            if (shuffleIntervalRef.current) clearInterval(shuffleIntervalRef.current);
        };
    }, [gameState]);

    useEffect(() => {
        if (gameState !== 'picking') {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
            setActiveColumn(null);
            return;
        }

        const startColumnAnimation = () => {
            let currentColumn = 0;
            const animateColumn = () => {
                if (gameState !== 'picking') return;
                setActiveColumn(currentColumn);
                currentColumn++;
                if (currentColumn < 12) {
                    animationTimeoutRef.current = setTimeout(animateColumn, 80);
                } else {
                    animationTimeoutRef.current = setTimeout(() => {
                        setActiveColumn(null);
                        const randomPause = 1500 + Math.random() * 500;
                        animationTimeoutRef.current = setTimeout(startColumnAnimation, randomPause);
                    }, 80);
                }
            };
            animateColumn();
        };
        startColumnAnimation();

        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [gameState]);

    const handleSelect = (index: number) => {
        if (gameState !== 'picking') return;

        const selectedItem = gridItems[index];
        const finalWinnings = betAmount * selectedItem.finalMultiplier * topSlotMultiplier;

        setSelectedIndex(index);
        setWinnings(finalWinnings);
        setGameState('revealed');
        setGridItems(prev => prev.map(item => ({ ...item, isFlipped: false })));
    };

    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        const finalMultipliersInOrder = gridItems.map(item => item.finalMultiplier);
        onComplete(winnings, { cashHuntMultipliers: finalMultipliersInOrder });
    };

    const getMessage = () => {
        switch (gameState) {
            case 'intro': return 'Get ready...';
            case 'shuffling': return 'Shuffling!';
            case 'picking': return 'Pick a symbol to reveal your multiplier!';
            default: return '';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-in fade-in p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-accent">Cash Hunt Bonus!</CardTitle>
                    {gameState !== 'revealed' && <p className="text-lg font-semibold text-center animate-pulse">{getMessage()}</p>}
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center gap-4 overflow-hidden">
                    {gameState === 'revealed' && selectedIndex !== null && (
                        <div className="text-center animate-in fade-in zoom-in-50">
                            <p className="text-xl font-semibold">You picked a {gridItems[selectedIndex].finalMultiplier}x multiplier!</p>
                             {topSlotMultiplier > 1 && (
                                <p className="text-lg text-accent font-bold animate-pulse">
                                    Top Slot Bonus: {topSlotMultiplier}x
                                </p>
                            )}
                            <p className="text-4xl font-bold text-accent my-2">You Won ${winnings.toLocaleString()}!</p>
                            <Button onClick={handleComplete} disabled={isCompleted} className="mt-2">Continue</Button>
                        </div>
                    )}
                    
                    <div className={cn("w-full flex-grow overflow-y-auto pr-2 relative rounded-md [perspective:1000px]")}>
                        <div className="grid grid-cols-12 gap-1.5 sm:gap-2">
                            {gridItems.map((item, index) => {
                                const isEvenRow = Math.floor(item.id / 12) % 2 === 0;

                                return (
                                    <div
                                        key={item.id}
                                        className="aspect-square transition-transform duration-700"
                                        style={{
                                            transform: item.introAnimated ? 'translateX(0)' : (isEvenRow ? 'translateX(-150%)' : 'translateX(150%)'),
                                        }}
                                    >
                                        <button
                                            onClick={() => handleSelect(index)}
                                            disabled={gameState !== 'picking'}
                                            className={cn(
                                                'relative w-full h-full rounded-md transition-all duration-500 [transform-style:preserve-3d]',
                                                item.isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]',
                                                gameState === 'picking' && (index % 12) === activeColumn && 'scale-105',
                                                gameState === 'revealed' && selectedIndex !== index && 'opacity-50',
                                                gameState === 'revealed' && selectedIndex === index && 'scale-110 ring-4 ring-accent z-10',
                                            )}
                                        >
                                            <div className="absolute w-full h-full flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold [backface-visibility:hidden] [transform:rotateY(0deg)]">
                                                {gameState === 'revealed' ? `${item.finalMultiplier}x` : `${item.displayMultiplier}x`}
                                            </div>
                                            
                                            <div className={cn(
                                                "absolute w-full h-full flex items-center justify-center rounded-md bg-secondary [backface-visibility:hidden] [transform:rotateY(180deg)]",
                                                gameState === 'picking' && (index % 12) === activeColumn && 'bg-accent/30',
                                                selectedIndex === index && 'bg-accent text-accent-foreground'
                                            )}>
                                                {item.symbol}
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
