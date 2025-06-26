
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Download, FastForward, RotateCcw, Play, Pause, TestTube2, BookCopy, FileClock, UploadCloud, RefreshCw, Trash2 } from 'lucide-react';
import { BET_OPTIONS, TOP_SLOT_LEFT_REEL_ITEMS, TOP_SLOT_RIGHT_REEL_ITEMS, SEGMENTS_CONFIG } from '@/config/game-config';
import type { GameLogEntry } from '@/config/game-config';

interface DevToolsProps {
    showLegend: boolean;
    setShowLegend: React.Dispatch<React.SetStateAction<boolean>>;
    setIsTopSlotSpinning: React.Dispatch<React.SetStateAction<boolean>>;
    handleSkipCountdown: () => void;
    gameState: string;
    isPaused: boolean;
    handleCloseRound: () => void;
    setIsPaused: React.Dispatch<React.SetStateAction<boolean>>;
    bgFileInputRef: React.RefObject<HTMLInputElement>;
    handleBgImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    textureFileInputRef: React.RefObject<HTMLInputElement>;
    handleTextureUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleUploadClick: (target: string) => void;
    setIsClearTexturesAlertOpen: React.Dispatch<React.SetStateAction<boolean>>;
    hasCustomAssets: boolean;
    handleDownloadLatestSpinData: () => void;
    gameLog: GameLogEntry[];
    handleGenerateAndDownload: () => void;
    isGenerating: boolean;
    handleDownloadLog: () => void;
    hideText: boolean;
    setHideText: React.Dispatch<React.SetStateAction<boolean>>;
    textureRotation: number;
    setTextureRotation: React.Dispatch<React.SetStateAction<number>>;
    customTextures: Record<string, string>;
    skipBetsInDataGen: boolean;
    setSkipBetsInDataGen: React.Dispatch<React.SetStateAction<boolean>>;
    forcedWinner: string | null;
    setForcedWinner: React.Dispatch<React.SetStateAction<string | null>>;
    forcedTopSlotLeft: string | null;
    setForcedTopSlotLeft: React.Dispatch<React.SetStateAction<string | null>>;
    forcedTopSlotRight: number | null;
    setForcedTopSlotRight: React.Dispatch<React.SetStateAction<number | null>>;
    backgroundImage: string;
    handleClearBackgroundImage: () => void;
    handleClearSingleTexture: (key: string) => void;
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
    bgFileInputRef,
    handleBgImageUpload,
    textureFileInputRef,
    handleTextureUpload,
    handleUploadClick,
    setIsClearTexturesAlertOpen,
    hasCustomAssets,
    handleDownloadLatestSpinData,
    gameLog,
    handleGenerateAndDownload,
    isGenerating,
    handleDownloadLog,
    hideText,
    setHideText,
    textureRotation,
    setTextureRotation,
    customTextures,
    skipBetsInDataGen,
    setSkipBetsInDataGen,
    forcedWinner,
    setForcedWinner,
    forcedTopSlotLeft,
    setForcedTopSlotLeft,
    forcedTopSlotRight,
    setForcedTopSlotRight,
    backgroundImage,
    handleClearBackgroundImage,
    handleClearSingleTexture,
}) => {
    const toTitleCase = (str: string) => str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    const numberBetOptions = BET_OPTIONS.filter(o => o.type === 'number');

    return (
        <footer className="w-full shrink-0 p-4 pt-0">
            <div className="mt-2 p-2 border border-dashed border-muted-foreground/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-muted-foreground font-semibold">
                        DEV TOOLS
                    </p>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
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
                        <Button variant="outline" size="sm" onClick={handleCloseRound} disabled={isPaused}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Close Round
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setIsPaused(p => !p)}>
                            {isPaused ? <Play className="mr-2 h-3 w-3" /> : <Pause className="mr-2 h-3 w-3" />}
                            {isPaused ? 'Resume' : 'Pause'}
                        </Button>
                        <input
                        type="file"
                        ref={bgFileInputRef}
                        onChange={handleBgImageUpload}
                        accept="image/*"
                        className="hidden"
                        />
                        <input
                        type="file"
                        ref={textureFileInputRef}
                        onChange={handleTextureUpload}
                        accept="image/*"
                        className="hidden"
                        />
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                            <UploadCloud className="mr-2 h-3 w-3" />
                            Upload Assets
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="max-h-[500px] overflow-y-auto w-64">
                            <DropdownMenuLabel>Upload custom image assets.</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>General</DropdownMenuLabel>
                                <DropdownMenuItem onSelect={() => handleUploadClick('background')} className="flex justify-between">
                                    <span>Background Image</span>
                                    <span className="text-muted-foreground text-xs">1920x1080px</span>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                             <DropdownMenuGroup>
                                <DropdownMenuLabel>Result Popups</DropdownMenuLabel>
                                {numberBetOptions.map(option => (
                                    <DropdownMenuItem key={`upload-result-popup-${option.id}`} onSelect={() => handleUploadClick(`result-popup-${option.id}`)} className="flex justify-between">
                                        <span>Popup for "{option.label}"</span>
                                        <span className="text-muted-foreground text-xs">Any</span>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Wheel Segments</DropdownMenuLabel>
                                <DropdownMenuItem key={`upload-wheel-full`} onSelect={() => handleUploadClick(`wheel-full`)} className="flex justify-between">
                                    <span>Full Wheel Texture</span>
                                    <span className="text-muted-foreground text-xs">420x420px</span>
                                </DropdownMenuItem>
                                {[...new Set(SEGMENTS_CONFIG.map(s => s.label))].sort().map(label => (
                                <DropdownMenuItem key={`upload-wheel-${label}`} onSelect={() => handleUploadClick(`wheel-${label}`)} className="flex justify-between">
                                    <span>{label.replace(/_/g, ' ')} (Segment)</span>
                                    <span className="text-muted-foreground text-xs">420x420px</span>
                                </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Top Slot: Bet Types</DropdownMenuLabel>
                                {[...new Set(TOP_SLOT_LEFT_REEL_ITEMS)].sort().map(item => (
                                <DropdownMenuItem key={`upload-topslot-left-${item}`} onSelect={() => handleUploadClick(`topslot-left-${item}`)} className="flex justify-between">
                                    <span>{item.replace(/_/g, ' ')}</span>
                                    <span className="text-muted-foreground text-xs">160x80px</span>
                                </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />

                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Top Slot: Multipliers</DropdownMenuLabel>
                                {[...new Set(TOP_SLOT_RIGHT_REEL_ITEMS)].sort((a,b) => a-b).map(item => (
                                <DropdownMenuItem key={`upload-topslot-right-${item}x`} onSelect={() => handleUploadClick(`topslot-right-${item}x`)} className="flex justify-between">
                                    <span>{item}x</span>
                                    <span className="text-muted-foreground text-xs">160x80px</span>
                                </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Betting Chips</DropdownMenuLabel>
                                {BET_OPTIONS.map(option => (
                                <DropdownMenuItem key={`upload-chip-${option.id}`} onSelect={() => handleUploadClick(`chip-${option.id}`)} className="flex justify-between">
                                    <span>{option.label}</span>
                                    <span className="text-muted-foreground text-xs">128x128px</span>
                                </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>History Log</DropdownMenuLabel>
                                {[...new Set(SEGMENTS_CONFIG.map(s => s.label))].sort().map(label => (
                                <DropdownMenuItem key={`upload-history-${label}`} onSelect={() => handleUploadClick(`history-${label}`)} className="flex justify-between">
                                    <span>{label.replace(/_/g, ' ')}</span>
                                    <span className="text-muted-foreground text-xs">40x40px</span>
                                </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" disabled={!hasCustomAssets}>
                                    <Trash2 className="mr-2 h-3 w-3" />
                                    Clear Asset
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="max-h-[500px] overflow-y-auto w-64">
                                <DropdownMenuLabel>Clear a specific asset</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                
                                {!backgroundImage.startsWith('https://placehold.co') && (
                                <DropdownMenuItem onSelect={handleClearBackgroundImage}>
                                    Background Image
                                </DropdownMenuItem>
                                )}

                                {Object.keys(customTextures).sort().map(key => (
                                <DropdownMenuItem key={key} onSelect={() => handleClearSingleTexture(key)}>
                                    {toTitleCase(key.replace(/-/g, ' ').replace(/_/g, ' '))}
                                </DropdownMenuItem>
                                ))}

                                {hasCustomAssets && <DropdownMenuSeparator />}
                                
                                <DropdownMenuItem onSelect={() => setIsClearTexturesAlertOpen(true)} className="text-destructive focus:bg-destructive focus:text-destructive-foreground">
                                    Clear All Assets...
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

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
                        disabled={!customTextures['wheel-full']}
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
