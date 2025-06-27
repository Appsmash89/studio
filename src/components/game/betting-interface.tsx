
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, adjustHsl } from '@/lib/utils';
import { RotateCcw, XCircle } from 'lucide-react';
import { BET_OPTIONS, CHIP_VALUES } from '@/config/game-config';

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

    return (
        <Card className="w-full p-4 bg-transparent border-none shadow-none">
            <CardContent className="p-0 flex flex-col gap-4">
                <div className="grid grid-cols-2 grid-rows-4 gap-2">
                    {BET_OPTIONS.map(renderBetButton)}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
                    <div className="flex-grow flex items-center gap-1.5 p-1 rounded-full bg-background/50">
                        {CHIP_VALUES.map(chip => (
                            <Button 
                                key={chip} 
                                size="sm" 
                                variant={selectedChip === chip ? 'default' : 'ghost'} 
                                className="rounded-full w-10 h-10 text-xs flex-shrink-0" 
                                onClick={() => setSelectedChip(chip)} 
                                disabled={bettingDisabled}
                            >
                                ${chip}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={handleUndoBet} disabled={bettingDisabled || Object.values(bets).every(b => b === 0)}><RotateCcw className="w-5 h-5" /></Button>
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
