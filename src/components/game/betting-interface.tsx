
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RotateCcw, XCircle } from 'lucide-react';
import { BET_OPTIONS, CHIP_VALUES, adjustHsl } from '@/config/game-config';

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
    customTextures: Record<string, string>;
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
    customTextures,
    hideText,
}) => {
    return (
        <Card className="w-full p-4 bg-card/50 backdrop-blur-sm border-accent/30 shadow-lg">
            <CardContent className="p-0 flex flex-col gap-4">
                <div className="grid grid-cols-2 grid-rows-4 gap-2">
                    {BET_OPTIONS.map(option => {
                        const customTexture = customTextures[`chip-${option.id}`];
                        const style: React.CSSProperties = {
                            color: option.textColor,
                            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                            fontFamily: "'Playfair Display', serif",
                        };

                        if (customTexture) {
                            style.backgroundImage = `url(${customTexture})`;
                            style.backgroundSize = 'cover';
                            style.backgroundPosition = 'center';
                            style.color = 'transparent';
                        } else {
                            style.background = `linear-gradient(145deg, ${option.color}, ${adjustHsl(option.color, -10, -20)})`;
                        }

                        return (
                            <Button
                                key={option.id}
                                variant="secondary"
                                style={style}
                                className={cn(
                                    "aspect-[255/128] h-auto w-full flex-col p-2 gap-1 relative shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
                                    "border-b-4 border-black/30 hover:border-b-2 active:border-b-0"
                                )}
                                onClick={() => handleBet(option.id)}
                                disabled={gameState !== 'BETTING' || isPaused}
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
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 p-1 rounded-md bg-background/50">
                        {CHIP_VALUES.map(chip => (
                            <Button key={chip} size="sm" variant={selectedChip === chip ? 'default' : 'ghost'} className="rounded-full w-10 h-10 text-xs" onClick={() => setSelectedChip(chip)} disabled={gameState !== 'BETTING' || isPaused}>
                                ${chip}
                            </Button>
                        ))}
                    </div>
                    <div className="flex-grow flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={handleUndoBet} disabled={gameState !== 'BETTING' || Object.values(bets).every(b => b === 0) || isPaused}><RotateCcw className="w-5 h-5" /></Button>
                        <Button variant="ghost" size="icon" onClick={handleClearBets} disabled={gameState !== 'BETTING' || totalBet === 0 || isPaused}><XCircle className="w-5 h-5" /></Button>
                        <Card className="bg-card/80">
                            <CardContent className="p-2 text-center">
                                <p className="text-sm text-muted-foreground">Total Bet</p>
                                <p className="text-2xl font-bold text-accent">${totalBet.toLocaleString()}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
