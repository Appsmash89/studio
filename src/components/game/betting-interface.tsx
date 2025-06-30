
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
    handleMultiBet: (optionIds: string[]) => void;
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
    balance: number;
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
    handleMultiBet,
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
    balance,
}) => {
    const [isChipSelectorOpen, setIsChipSelectorOpen] = useState(false);
    const bettingDisabled = gameState !== 'BETTING' || isPaused;
    const chipDialRef = useRef<HTMLDivElement>(null);
    const chipSelectorButtonRef = useRef<HTMLButtonElement>(null);
    const betOptionRefs = useRef<{[key: string]: HTMLButtonElement | null}>({});
    const containerRef = useRef<HTMLDivElement>(null);
    const [flyingChips, setFlyingChips] = useState<any[]>([]);

    const numberOptions = BET_OPTIONS.slice(0, 4);
    const bonusOptions = BET_OPTIONS.slice(4, 8);

    useEffect(() => {
        if (gameState !== 'BETTING') {
            setIsChipSelectorOpen(false);
        }
    }, [gameState]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (chipDialRef.current && !chipDialRef.current.contains(event.target as Node)) {
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

    const handleAnimationEnd = (chipId: number) => {
        setFlyingChips((chips) => chips.filter((chip) => chip.id !== chipId));
    };

    const handleBetClick = (optionId: string) => {
        if (bettingDisabled) return;

        if (balance < selectedChip || selectedChip === 0) {
            handleBet(optionId);
            return;
        }

        const startEl = chipSelectorButtonRef.current;
        const endEl = betOptionRefs.current[optionId];
        const containerEl = containerRef.current;

        if (!startEl || !endEl || !containerEl) {
            handleBet(optionId);
            return;
        }

        const containerRect = containerEl.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        const endRect = endEl.getBoundingClientRect();

        const newChip = {
            id: Date.now() + Math.random(),
            value: selectedChip,
            startX: startRect.left + startRect.width / 2 - containerRect.left,
            startY: startRect.top + startRect.height / 2 - containerRect.top,
            endX: endRect.left + endRect.width / 2 - containerRect.left,
            endY: endRect.top + endRect.height / 2 - containerRect.top,
        };

        setFlyingChips((current) => [...current, newChip]);
        handleBet(optionId);
    };

    const handleMultiBetClick = (optionIds: string[]) => {
        if (bettingDisabled) return;

        const totalBetAmount = selectedChip * optionIds.length;
        if (balance < totalBetAmount || selectedChip === 0) {
            handleMultiBet(optionIds);
            return;
        }

        const startEl = chipSelectorButtonRef.current;
        const containerEl = containerRef.current;

        if (!startEl || !containerEl) {
            handleMultiBet(optionIds);
            return;
        }

        const containerRect = containerEl.getBoundingClientRect();
        const startRect = startEl.getBoundingClientRect();
        
        const newChips = optionIds.map(optionId => {
            const endEl = betOptionRefs.current[optionId];
            if (!endEl) return null;
            const endRect = endEl.getBoundingClientRect();

            return {
                id: Date.now() + Math.random(),
                value: selectedChip,
                startX: startRect.left + startRect.width / 2 - containerRect.left,
                startY: startRect.top + startRect.height / 2 - containerRect.top,
                endX: endRect.left + endRect.width / 2 - containerRect.left,
                endY: endRect.top + endRect.height / 2 - containerRect.top,
            };
        }).filter((chip): chip is Exclude<typeof chip, null> => chip !== null);

        if (newChips.length > 0) {
          setFlyingChips((current) => [...current, ...newChips]);
        }
        handleMultiBet(optionIds);
    };

    const otherChips = chipValues.filter(c => c !== selectedChip);
    const arcDegrees = 270;
    const startAngle = -180;
    const angleIncrement = arcDegrees / (otherChips.length > 1 ? otherChips.length - 1 : 1);


    const formatChipValue = (value: number) => {
        if (value >= 1000) {
            return `${value / 1000}k`;
        }
        return value;
    }

    const renderBettingButton = (option: typeof BET_OPTIONS[number]) => {
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
                ref={(el) => betOptionRefs.current[option.id] = el}
                variant="secondary"
                style={style}
                className={cn(
                    "aspect-[2/1] h-auto w-full flex-col p-2 gap-1",
                    "border-b-4 border-black/30 hover:border-b-2 active:border-b-0 active:scale-95",
                    "transition-transform duration-200 disabled:opacity-100"
                )}
                onClick={() => handleBetClick(option.id)}
                disabled={bettingDisabled}
            >
                <div className="flex flex-col items-center justify-center gap-1">
                    <span className={cn(
                        "font-bold drop-shadow-md",
                        option.type === 'number' ? 'text-2xl' : 'text-sm tracking-wide uppercase leading-tight text-center',
                        customTexture && hideText ? 'text-transparent' : option.textColor,
                        (customTexture && hideText) && 'text-transparent'
                    )} style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)', fontFamily: "'Playfair Display', serif" }}>
                        {option.label}
                    </span>
                    {bets[option.id] > 0 &&
                        <div className={cn(
                            "flex items-center justify-center px-2 py-0.5 min-w-[32px] h-6 rounded-full bg-background/70 backdrop-blur-sm border border-accent text-accent font-bold text-xs shadow-md",
                            (customTexture && hideText) && 'invisible'
                        )}>
                            ${bets[option.id].toLocaleString()}
                        </div>
                    }
                </div>
            </Button>
        )
    };

    const multiBetTexture = assetUrls['multi-bet-button'];
    const multiBetStyle: React.CSSProperties = {};
    if (multiBetTexture) {
        multiBetStyle.backgroundImage = `url(${multiBetTexture})`;
        multiBetStyle.backgroundSize = 'cover';
        multiBetStyle.backgroundPosition = 'center';
    }

    const renderMultiBetButton = (optionIds: string[]) => (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <Button
                size="icon"
                variant="outline"
                className={cn(
                    "rounded-full w-14 h-14 transition-all hover:scale-105 active:scale-100",
                    !multiBetTexture && "bg-background/70 backdrop-blur-sm border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                )}
                style={multiBetStyle}
                onClick={() => handleMultiBetClick(optionIds)}
                disabled={bettingDisabled}
            >
                {!multiBetTexture && (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="7" cy="7" r="2.5" fill="currentColor"/>
                        <circle cx="17" cy="7" r="2.5" fill="currentColor"/>
                        <circle cx="7" cy="17" r="2.5" fill="currentColor"/>
                        <circle cx="17" cy="17" r="2.5" fill="currentColor"/>
                    </svg>
                )}
            </Button>
        </div>
    );

    return (
        <>
            {isChipSelectorOpen && (
                <div className="fixed inset-0 bg-black/70 z-40 animate-in fade-in" />
            )}
            <Card className="w-full p-4 bg-transparent border-none shadow-none">
                <div ref={containerRef} className="relative">
                    <CardContent className="p-0 flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                             <div className="relative">
                                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                                    {numberOptions.map(renderBettingButton)}
                                </div>
                                {renderMultiBetButton(numberOptions.map(o => o.id))}
                            </div>
                            <div className="relative">
                                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                                    {bonusOptions.map(renderBettingButton)}
                                </div>
                                {renderMultiBetButton(bonusOptions.map(o => o.id))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-2">
                            <div ref={chipDialRef} className="relative w-24 h-24 flex items-center justify-center z-50">
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
                                                    ? `rotate(${angle}deg) translate(70px) rotate(${-angle}deg)`
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
                                    ref={chipSelectorButtonRef}
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
                    {flyingChips.map((chip) => (
                        <div
                            key={chip.id}
                            onAnimationEnd={() => handleAnimationEnd(chip.id)}
                            className="absolute top-0 left-0 rounded-full flex items-center justify-center font-bold text-lg pointer-events-none animate-fly-to-target z-50"
                            style={{
                                '--start-x': `${chip.startX}px`,
                                '--start-y': `${chip.startY}px`,
                                '--end-x': `${chip.endX}px`,
                                '--end-y': `${chip.endY}px`,
                                width: '3.5rem', // w-14
                                height: '3.5rem', // h-14
                                transform: `translate(calc(var(--start-x) - 1.75rem), calc(var(--start-y) - 1.75rem))`, // Start centered
                                backgroundColor: chipColors[chip.value] || '#cccccc',
                                color: chipTextColors[chip.value] || '#000000',
                            } as React.CSSProperties}
                        >
                            ${formatChipValue(chip.value)}
                        </div>
                    ))}
                </div>
            </Card>
        </>
    );
};
