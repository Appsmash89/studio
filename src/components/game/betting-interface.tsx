
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, adjustHsl } from '@/lib/utils';
import { RotateCcw, XCircle } from 'lucide-react';
import { BET_OPTIONS } from '@/config/game-config';

interface BettingInterfaceProps {
    bets: { [key: string]: number };
    handleBet: (optionId: string) => void;
    gameState: string;
    isPaused: boolean;
    selectedChip: number;
    setSelectedChip: React.Dispatch<React.SetStateAction<number>>;
    handleUndoBet: () => void;
    handleClearBets: () => void;
    totalBet: number;
    assetUrls: Record<string, string>;
    hideText: boolean;
}

export const BettingInterface: React.FC<BettingInterfaceProps> = ({
    bets,
    handleBet,
    gameState,
    isPaused,
    selectedChip,
    setSelectedChip,
    handleUndoBet,
    handleClearBets,
    totalBet,
    assetUrls,
    hideText,
}) => {
    const bettingDisabled = gameState !== 'BETTING' || isPaused;

    const renderBetButton = (option: typeof BET_OPTIONS[0]) => {
        const customTexture = assetUrls[`chip-${option.id}`];
        const style: React.CSSProperties = {
            color: option.textColor,
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            fontFamily: "'Playfair Display', serif",
        };

        if (customTexture) {
            style.backgroundImage = `url(${customTexture})`;
            style.backgroundSize = 'cover';
            style.backgroundPosition = 'center';
        } else {
            style.background = `linear-gradient(145deg, ${option.color}, ${adjustHsl(option.color, -10, -20)})`;
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
                    (customTexture && hideText) && 'text-transparent'
                )}>
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
    
    const chipColors: { [key: number]: string } = {
        1: 'hsl(0, 0%, 80%)',
        5: 'hsl(0, 70%, 50%)',
        10: 'hsl(210, 70%, 50%)',
        25: 'hsl(120, 50%, 45%)',
        100: 'hsl(0, 0%, 10%)',
    };
    
    const chipTextColors: { [key: number]: string } = {
        1: 'hsl(0, 0%, 10%)',
        5: 'hsl(0, 0%, 100%)',
        10: 'hsl(0, 0%, 100%)',
        25: 'hsl(0, 0%, 100%)',
        100: 'hsl(45, 90%, 60%)',
    }

    return (
        <Card className="w-full p-4 bg-transparent border-none shadow-none">
            <CardContent className="p-0 flex flex-col gap-4">
                <div className="grid grid-cols-2 grid-rows-4 gap-2">
                    {BET_OPTIONS.map(renderBetButton)}
                </div>

                <div className="flex items-center justify-between gap-2 mt-2">
                    {/* Simplified Chip Display */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                        <Button
                            size="icon"
                            style={{ 
                                backgroundColor: chipColors[selectedChip],
                                color: chipTextColors[selectedChip],
                            }}
                            className={cn(
                                'rounded-full w-14 h-14 text-lg font-bold shadow-lg',
                                'border-b-4 border-black/30 hover:border-b-2 active:border-b-0'
                            )}
                            disabled={bettingDisabled}
                        >
                            ${selectedChip}
                        </Button>
                    </div>
                    
                    {/* Controls on the right */}
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
    );
};
