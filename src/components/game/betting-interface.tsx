
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RotateCcw, XCircle } from 'lucide-react';
import { BET_OPTIONS } from '@/config/game-config';

interface BettingInterfaceProps {
    bets: { [key: string]: number };
    handleBet: (optionId: string) => void;
    gameState: string;
    isPaused: boolean;
    chipValues: number[];
    selectedChip: number;
    setSelectedChip: React.Dispatch<React.SetStateAction<number>>;
    handleUndoBet: () => void;
    handleClearBets: () => void;
    totalBet: number;
    assetUrls: Record<string, string>;
    hideText: boolean;
}

const chipColors: { [key: number]: string } = {
    1: 'hsl(0, 0%, 80%)',
    2: 'hsl(180, 50%, 60%)',
    5: 'hsl(0, 70%, 50%)',
    10: 'hsl(210, 70%, 50%)',
    25: 'hsl(120, 50%, 45%)',
    50: 'hsl(50, 80%, 60%)',
    100: 'hsl(0, 0%, 10%)',
    250: 'hsl(270, 70%, 50%)',
    500: 'hsl(30, 90%, 55%)',
    1000: 'hsl(330, 80%, 60%)',
    2500: 'hsl(240, 100%, 80%)',
    5000: 'hsl(150, 100%, 40%)',
    10000: 'hsl(0, 0%, 95%)',
    25000: 'hsl(45, 100%, 50%)',
    50000: 'hsl(60, 100%, 75%)',
    100000: 'hsl(0, 0%, 0%)',
    250000: 'hsl(180, 100%, 80%)',
};

const chipTextColors: { [key: number]: string } = {
    1: 'hsl(0, 0%, 10%)',
    2: 'hsl(0, 0%, 10%)',
    5: 'hsl(0, 0%, 100%)',
    10: 'hsl(0, 0%, 100%)',
    25: 'hsl(0, 0%, 100%)',
    50: 'hsl(0, 0%, 10%)',
    100: 'hsl(45, 90%, 60%)',
    250: 'hsl(0, 0%, 100%)',
    500: 'hsl(0, 0%, 100%)',
    1000: 'hsl(0, 0%, 100%)',
    2500: 'hsl(0, 0%, 10%)',
    5000: 'hsl(0, 0%, 100%)',
    10000: 'hsl(0, 0%, 10%)',
    25000: 'hsl(0, 0%, 10%)',
    50000: 'hsl(0, 0%, 10%)',
    100000: 'hsl(45, 90%, 60%)',
    250000: 'hsl(0, 0%, 10%)',
};


export const BettingInterface: React.FC<BettingInterfaceProps> = ({
    bets,
    handleBet,
    gameState,
    isPaused,
    chipValues,
    selectedChip,
    setSelectedChip,
    handleUndoBet,
    handleClearBets,
    totalBet,
    assetUrls,
    hideText,
}) => {
    const [isChipSelectorOpen, setIsChipSelectorOpen] = useState(false);
    const bettingDisabled = gameState !== 'BETTING' || isPaused;
    const chipSelectorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (gameState !== 'BETTING') {
            setIsChipSelectorOpen(false);
        }
    }, [gameState]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (chipSelectorRef.current && !chipSelectorRef.current.contains(event.target as Node)) {
                setIsChipSelectorOpen(false);
            }
        }

        if (isChipSelectorOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isChipSelectorOpen]);

    const renderBetButton = (option: typeof BET_OPTIONS[0]) => {
        const customTexture = assetUrls[`chip-${option.id}`];
        const style: React.CSSProperties = {};

        if (customTexture) {
            style.backgroundImage = `url(${customTexture})`;
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
        } else {
            style.backgroundColor = option.color;
        }

        return (
            <Button
                key={option.id}
                variant="secondary"
                style={style}
                className={cn(
                    "aspect-[2/1] h-auto w-full flex-col p-2 gap-1 relative shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
                    "border-b-4 border-black/30 hover:border-b-2 active:border-b-0"
                )}
                onClick={() => handleBet(option.id)}
                disabled={bettingDisabled}
            >
                <span className={cn(
                    "font-bold drop-shadow-md",
                    option.type === 'number' ? 'text-2xl' : 'text-sm tracking-wide uppercase leading-tight text-center',
                    customTexture && hideText ? 'text-transparent' : option.textColor,
                    (customTexture && hideText) && 'text-transparent'
                )} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)', fontFamily: "'Playfair Display', serif" }}>
                    {option.label}
                </span>
                <span className={cn(
                    "text-sm font-mono font-semibold text-white/90 drop-shadow-sm",
                    (customTexture && hideText) && 'text-transparent'
                )}>
                    ${bets[option.id].toLocaleString()}
                </span>
            </Button>
        )
    };

    const otherChips = chipValues.filter(c => c !== selectedChip);
    const arcDegrees = 220; 
    const startAngle = -155;
    const angleIncrement = arcDegrees / (otherChips.length > 1 ? otherChips.length - 1 : 1);


    const formatChipValue = (value: number) => {
        if (value >= 1000) {
            return `${value / 1000}k`;
        }
        return value;
    }

    return (
        <>
            {isChipSelectorOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 animate-in fade-in" />
            )}
            <Card className="w-full p-4 bg-transparent border-none shadow-none">
                <CardContent className="p-0 flex flex-col gap-4">
                    <div className="grid grid-cols-2 grid-rows-4 gap-2">
                        {BET_OPTIONS.map(renderBetButton)}
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2">
                        <div ref={chipSelectorRef} className="relative w-24 h-24 flex items-center justify-center z-50">
                            {/* Container for the arc chips */}
                            {otherChips.map((chip, index) => {
                                const angle = startAngle + index * angleIncrement;
                                return (
                                    <div
                                        key={chip}
                                        className={cn(
                                            "absolute top-1/2 left-1/2 w-14 h-14 -mt-7 -ml-7 transition-all",
                                            isChipSelectorOpen ? 'opacity-100' : 'opacity-0 scale-50 pointer-events-none'
                                        )}
                                        style={{
                                            transform: isChipSelectorOpen
                                                ? `rotate(${angle}deg) translate(95px) rotate(${-angle}deg)`
                                                : 'rotate(0deg) translate(0px)',
                                            transitionDuration: isChipSelectorOpen ? '100ms' : '100ms',
                                            transitionDelay: isChipSelectorOpen ? `${index * 5}ms` : '0ms',
                                        }}
                                    >
                                        <Button
                                            size="icon"
                                            style={{ backgroundColor: chipColors[chip] || '#cccccc', color: chipTextColors[chip] || '#000000' }}
                                            className="rounded-full w-full h-full text-lg font-bold shadow-lg border-b-4 border-black/30 hover:border-b-2 active:border-b-0"
                                            onClick={() => {
                                                setSelectedChip(chip);
                                                setIsChipSelectorOpen(false);
                                            }}
                                            disabled={bettingDisabled}
                                        >
                                            ${formatChipValue(chip)}
                                        </Button>
                                    </div>
                                );
                            })}
                            
                            {/* Main selected chip, always on top */}
                            <Button
                                size="icon"
                                style={{ backgroundColor: chipColors[selectedChip] || '#cccccc', color: chipTextColors[selectedChip] || '#000000' }}
                                className={cn(
                                    'relative rounded-full w-14 h-14 text-lg font-bold shadow-lg z-10',
                                    'border-b-4 border-black/30 hover:border-b-2 active:border-b-0'
                                )}
                                onClick={() => !bettingDisabled && setIsChipSelectorOpen(!isChipSelectorOpen)}
                                disabled={bettingDisabled}
                            >
                                ${formatChipValue(selectedChip)}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={handleUndoBet} disabled={bettingDisabled || totalBet === 0}><RotateCcw className="w-5 h-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={handleClearBets} disabled={bettingDisabled || totalBet === 0}><XCircle className="w-5 h-5" /></Button>
                            <Card className="bg-card/80">
                                <CardContent className="p-2 text-center min-w-[120px]">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Bet</p>
                                    <p className="text-xl font-bold text-accent">${totalBet.toLocaleString()}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    );
};
