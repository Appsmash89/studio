
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Download, FastForward, Play, Pause, TestTube2, BookCopy, FileClock, RefreshCw, Trash2, HelpCircle } from 'lucide-react';
import { BET_OPTIONS, TOP_SLOT_LEFT_REEL_ITEMS, TOP_SLOT_RIGHT_REEL_ITEMS } from '@/config/game-config';
import type { GameLogEntry } from '@/types/game';
import { assetManager } from '@/lib/asset-manager';
import { useToast } from '@/hooks/use-toast';

interface DevToolsProps {
    showLegend: boolean;
    setShowLegend: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTopSlotSpinning: React.Dispatch<React.SetStateAction<boolean>>;
    handleSkipCountdown: () => void;
    gameState: string;
    isPaused: boolean;
    handleCloseRound: () => void;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
    handleDownloadLatestSpinData: () => void;
    gameLog: GameLogEntry[];
    handleGenerateAndDownload: () => void;
    isGenerating: boolean;
    handleDownloadLog: () => void;
    hideText: boolean;
    setHideText: React.Dispatch<React.SetStateAction<boolean>>;
    textureRotation: number;
    setTextureRotation: React.Dispatch<React.SetStateAction<number>>;
    assetUrls: Record<string, string>;
    skipBetsInDataGen: boolean;
    setSkipBetsInDataGen: React.Dispatch<React.SetStateAction<boolean>>;
    forcedWinner: string | null;
    setForcedWinner: React.Dispatch<React.SetStateAction<string | null>>;
    forcedTopSlotLeft: string | null;
    setForcedTopSlotLeft: React.Dispatch<React.SetStateAction<string | null>>;
    forcedTopSlotRight: number | null;
    setForcedTopSlotRight: React.Dispatch<React.SetStateAction<number | null>>;
}


export const DevTools: React.FC<DevToolsProps> = ({
    showLegend,
    setShowLegend,
    setIsTopSlotSpinning,
    handleSkipCountdown,
    gameState,
    isPaused,
    handleCloseRound,
    setIsPaused,
    handleDownloadLatestSpinData,
    gameLog,
    handleGenerateAndDownload,
    isGenerating,
    handleDownloadLog,
    hideText,
    setHideText,
    textureRotation,
    setTextureRotation,
    assetUrls,
    skipBetsInDataGen,
    setSkipBetsInDataGen,
    forcedWinner,
    setForcedWinner,
    forcedTopSlotLeft,
    setForcedTopSlotLeft,
    forcedTopSlotRight,
    setForcedTopSlotRight,
}) => {
    const { toast } = useToast();

    const handleClearAssetCache = async () => {
        toast({ title: 'Clearing Cache...', description: 'Please wait. The page will reload automatically.' });
        await assetManager.clearCache();
        window.location.reload();
    };

    return (
        <footer className="w-full shrink-0 p-4 pt-0">
            <div className="mt-2 p-2 border border-dashed border-muted-foreground/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground font-semibold">
                        DEV TOOLS
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                        <Button asChild variant="outline" size="sm">
                          <Link href="/layout-guide">
                            <HelpCircle className="mr-2 h-3 w-3" />
                            Layout Guide
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setShowLegend(s => !s)}>
                            <BookCopy className="mr-2 h-3 w-3" />
                            {showLegend ? 'Hide' : 'Show'} Legend
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsTopSlotSpinning(s => !s)}>
                            <TestTube2 className="mr-2 h-3 w-3" />
                            Test Top Slot
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSkipCountdown} disabled={gameState !== 'BETTING' || isPaused}>
                            <FastForward className="mr-2 h-3 w-3" />
                            Skip Timer
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleCloseRound} 
                            disabled={isPaused || gameState === 'BETTING' || gameState.startsWith('BONUS_')}
                        >
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Close Round
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPaused(p => !p)}>
                            {isPaused ? <Play className="mr-2 h-3 w-3" /> : <Pause className="mr-2 h-3 w-3" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleClearAssetCache}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Clear Asset Cache
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadLatestSpinData} disabled={gameLog.length === 0}>
                            <Download className="mr-2 h-3 w-3" />
                            Latest Spin
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleGenerateAndDownload} disabled={isGenerating}>
                            <FileClock className="mr-2 h-3 w-3" />
                            {isGenerating ? 'Generating...' : 'Generate Hour Log'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadLog} disabled={gameLog.length === 0}>
                            <Download className="mr-2 h-3 w-3" />
                            Full Log
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                        id="hide-text" 
                        checked={hideText} 
                        onCheckedChange={(checked) => setHideText(Boolean(checked))}
                    />
                    <label
                        htmlFor="hide-text"
                        className="text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Hide text on textured elements
                    </label>
                </div>
                <div className="flex flex-col space-y-1 mb-2">
                    <Label htmlFor="texture-rotation" className="text-xs font-medium text-muted-foreground">
                        Wheel Texture Rotation (°)
                    </Label>
                    <Input
                        id="texture-rotation"
                        type="number"
                        step="0.1"
                        value={textureRotation}
                        onChange={(e) => setTextureRotation(parseFloat(e.target.value) || 0)}
                        disabled={!assetUrls['wheel-full']}
                        className="h-8"
                    />
                </div>
                    <div className="flex items-center space-x-2 mb-2">
                    <Checkbox 
                        id="skip-bets" 
                        checked={skipBetsInDataGen} 
                        onCheckedChange={(checked) => setSkipBetsInDataGen(Boolean(checked))}
                        disabled={isPaused}
                    />
                    <label
                        htmlFor="skip-bets"
                        className="text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Skip random bet placement in simulation data
                    </label>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                    Force Next Spin Outcome:
                </p>
                <div className="grid grid-cols-4 gap-2">
                    {BET_OPTIONS.map(option => (
                    <Button
                        key={`force-${option.id}`}
                        size="sm"
                        variant="outline"
                        onClick={() => setForcedWinner(option.id)}
                        disabled={gameState !== 'BETTING' || isPaused}
                        className={cn("h-auto p-1 text-[10px]", {"ring-2 ring-accent": forcedWinner === option.id})}
                    >
                        {option.label}
                    </Button>
                    ))}
                </div>

                <div className="mt-4">
                    <p className="text-xs text-muted-foreground mb-1">
                        Force Top Slot Outcome:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <Select onValueChange={(value) => setForcedTopSlotLeft(value === 'null' ? null : value)} value={forcedTopSlotLeft ?? 'null'} disabled={gameState !== 'BETTING' || isPaused}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Left Reel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">Random</SelectItem>
                                {[...new Set(TOP_SLOT_LEFT_REEL_ITEMS)].sort().map(item => (
                                    <SelectItem key={`force-left-${item}`} value={item}>{item.replace(/_/g, ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setForcedTopSlotRight(value === 'null' ? null : Number(value))} value={forcedTopSlotRight?.toString() ?? 'null'} disabled={gameState !== 'BETTING' || isPaused}>
                            <SelectTrigger className="h-8 text-xs">
                                <SelectValue placeholder="Right Reel" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">Random</SelectItem>
                                {[...new Set(TOP_SLOT_RIGHT_REEL_ITEMS)].sort((a, b) => a - b).map(item => (
                                    <SelectItem key={`force-right-${item}`} value={String(item)}>{item}x</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {showLegend && (
                    <Card className="mt-4 p-4 text-xs bg-background/70">
                    <CardHeader className="p-0 pb-2">
                        <CardTitle className="text-sm">Index Legend</CardTitle>
                        <CardDescription className="text-xs">Categorized indexes used in the game log.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h5 className="font-semibold mt-2">1. Main Wheel / Top Slot Bet Type</h5>
                            <ul className="list-inside mt-1 space-y-1">
                            {BET_OPTIONS.map((option, index) => (
                                <li key={`legend-bet-${index}`} className="flex items-center gap-2">
                                <code className="bg-muted px-1.5 py-0.5 rounded-sm">{index}</code>
                                <span>{option.label}</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mt-2">2. Top Slot Multiplier</h5>
                            <ul className="list-inside mt-1 space-y-1">
                            {TOP_SLOT_RIGHT_REEL_ITEMS.map((item, index) => (
                                <li key={`legend-mult-${index}`} className="flex items-center gap-2">
                                <code className="bg-muted px-1.5 py-0.5 rounded-sm">{index}</code>
                                <span>{item}x</span>
                                </li>
                            ))}
                            </ul>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
                {forcedWinner && (
                    <p className="text-xs text-center text-accent mt-2 animate-pulse">
                    Next spin will land on: {BET_OPTIONS.find(o => o.id === forcedWinner)?.label || forcedWinner}
                    </p>
                )}
            </div>
        </footer>
    );
};

    
