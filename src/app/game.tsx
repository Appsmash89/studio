
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup } from '@/components/ui/dropdown-menu';
import { Wallet, Sparkles, XCircle, Download, FastForward, RotateCcw, Upload, Play, Pause, TestTube2, BookCopy, FileClock, UploadCloud, RefreshCw, Trash2, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { CoinFlipBonus } from '@/components/bonus/coin-flip-bonus';
import { PachinkoBonus } from '@/components/bonus/pachinko-bonus';
import { CashHuntBonus } from '@/components/bonus/cash-hunt-bonus';
import { CrazyTimeBonus } from '@/components/bonus/crazy-time-bonus';
import { TopSlot, TOP_SLOT_RIGHT_REEL_ITEMS } from '@/components/top-slot';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const BET_OPTIONS = [
  { id: '1', label: '1', type: 'number', color: 'hsl(220, 15%, 85%)', textColor: 'hsl(var(--background))' },
  { id: '2', label: '2', type: 'number', color: 'hsl(210, 80%, 55%)', textColor: 'white' },
  { id: '5', label: '5', type: 'number', color: 'hsl(140, 60%, 50%)', textColor: 'white' },
  { id: '10', label: '10', type: 'number', color: 'hsl(280, 80%, 65%)', textColor: 'white' },
  { id: 'COIN_FLIP', label: 'Coin Flip', type: 'bonus', color: 'hsl(45, 90%, 60%)', textColor: 'hsl(var(--background))' },
  { id: 'PACHINKO', label: 'Pachinko', type: 'bonus', color: 'hsl(320, 70%, 60%)', textColor: 'white' },
  { id: 'CASH_HUNT', label: 'Cash Hunt', type: 'bonus', color: 'hsl(100, 60%, 60%)', textColor: 'hsl(var(--background))' },
  { id: 'CRAZY_TIME', label: 'Crazy Time', type: 'bonus', color: 'hsl(0, 80%, 60%)', textColor: 'white' },
];

const BET_OPTION_INDEX_MAP = BET_OPTIONS.reduce((acc, option, index) => {
    acc[option.id] = index;
    return acc;
}, {} as Record<string, number>);

const textColorMap = BET_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.textColor;
  return acc;
}, {} as Record<string, string>);

const SEGMENTS_CONFIG = [
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "COIN_FLIP", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "2", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "1", "type": "bonus", "multiplier": 0, "color": "hsl(45, 90%, 60%)" },
  { "label": "10", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "CASH_HUNT", "type": "number", "multiplier": 10, "color": "hsl(280, 80%, 65%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "5", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "COIN_FLIP", "type": "bonus", "multiplier": 0, "color": "hsl(320, 70%, 60%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "5", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "10", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "PACHINKO", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "1", "type": "bonus", "multiplier": 0, "color": "hsl(45, 90%, 60%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "5", "type": "number", "multiplier": 10, "color": "hsl(280, 80%, 65%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "COIN_FLIP", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "10", "type": "bonus", "multiplier": 0, "color": "hsl(100, 60%, 60%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "5", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "CASH_HUNT", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "bonus", "multiplier": 0, "color": "hsl(45, 90%, 60%)" },
  { "label": "5", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "number", "multiplier": 10, "color": "hsl(280, 80%, 65%)" },
  { "label": "2", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "COIN_FLIP", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "2", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "10", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "bonus", "multiplier": 0, "color": "hsl(0, 80%, 60%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "CRAZY_TIME", "type": "bonus", "multiplier": 0, "color": "hsl(320, 70%, 60%)" },
  { "label": "1", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "2", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "5", "type": "number", "multiplier": 10, "color": "hsl(280, 80%, 65%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "2", "type": "number", "multiplier": 5, "color": "hsl(140, 60%, 50%)" },
  { "label": "PACHINKO", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "1", "type": "bonus", "multiplier": 0, "color": "hsl(45, 90%, 60%)" },
  { "label": "5", "type": "number", "multiplier": 2, "color": "hsl(210, 80%, 55%)" },
  { "label": "1", "type": "number", "multiplier": 1, "color": "hsl(220, 15%, 85%)" },
  { "label": "2", "type": "bonus", "multiplier": 0, "color": "hsl(100, 60%, 60%)" }
].map((seg, index) => {
    const betOption = BET_OPTIONS.find(bo => bo.id === seg.label);
    if (!betOption) {
        // Fallback for labels that don't have a direct match in BET_OPTIONS (e.g. if a '1' is a bonus)
        // This is a simple heuristic. A more robust solution might require a mapping.
        const isBonus = seg.type === 'bonus';
        const numericValue = parseInt(seg.label, 10);
        
        let type = seg.type;
        let multiplier = seg.multiplier;
        
        if (!isNaN(numericValue)) {
            type = 'number';
            multiplier = numericValue;
        } else {
            type = 'bonus';
            multiplier = 0;
        }

        return { ...seg, type, multiplier, id: `segment-${index}`, textColor: textColorMap[seg.label] || 'white' };
    }
    return { ...seg, type: betOption.type, multiplier: betOption.type === 'bonus' ? 0 : parseInt(betOption.label, 10), id: `segment-${index}`, textColor: betOption.textColor };
});


const NUM_SEGMENTS = SEGMENTS_CONFIG.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
const SPIN_DURATION_SECONDS = 8;
const BETTING_TIME_SECONDS = 15;
const RESULT_DISPLAY_SECONDS = 5;
const TOP_SLOT_ANIMATION_DURATION_MS = 3500;

// Rebalanced to reduce the probability of '1' appearing.
export const TOP_SLOT_LEFT_REEL_ITEMS = [ '1', '5', '2', '10', 'COIN_FLIP', '2', '1', 'PACHINKO', '5', '2', 'CASH_HUNT', '10', '1', '5', '2', 'COIN_FLIP', '1', '10', '2', '5', 'PACHINKO', '2', 'CRAZY_TIME', '5', '1', ];

const CHIP_VALUES = [1, 5, 10, 25, 100];
const initialBetsState = BET_OPTIONS.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});

type GameLogEntry = {
  spinId: number;
  timestamp: string;
  bets: { [key: string]: number };
  totalBet: number;
  winningSegment: {
    label: string;
    type: string;
    multiplier: number;
    index: number;
  };
  topSlotResult?: { 
    left: string | null; 
    right: number | null; 
    leftIndex: number | null; 
    rightIndex: number | null;
  } | null;
  isBonus: boolean;
  bonusWinnings?: number;
  bonusDetails?: {
    coinFlipMultipliers?: { red: number; blue: number };
    cashHuntMultipliers?: number[];
    pachinkoDropHistory?: (number | 'DOUBLE')[];
    pachinkoFinalMultipliers?: (number | 'DOUBLE')[];
    crazyTimeDetails?: {
        selectedFlapper: 'green' | 'blue' | 'yellow' | null;
        spinHistory: (string | number)[];
        finalSegments: (string | number)[];
    };
  };
  roundWinnings: number;
  netResult: number;
};

const adjustHsl = (hsl: string, h: number, l: number) => {
  const [hue, saturation, lightness] = hsl.match(/\d+/g)!.map(Number);
  return `hsl(${hue + h}, ${saturation}%, ${lightness + l}%)`;
}

const Wheel = ({ segments, rotation, customTextures, hideText, textureRotation }: { segments: (typeof SEGMENTS_CONFIG); rotation: number; customTextures: Record<string, string>; hideText: boolean; textureRotation: number; }) => {
  const radius = 200;
  const center = 210;
  const fullWheelTexture = customTextures['wheel-full'];

  const getSegmentPath = (index: number) => {
    const startAngle = index * SEGMENT_ANGLE;
    const endAngle = (index + 1) * SEGMENT_ANGLE;
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 0 0 ${end.x},${end.y} Z`;
  };
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const getLabelPosition = (index: number, isBonus: boolean) => {
    const angle = (index + 0.5) * SEGMENT_ANGLE;
    const distance = isBonus ? radius * 0.72 : radius * 0.75;
    return polarToCartesian(center, center, distance, angle);
  };
  
  const bulbs = Array.from({ length: NUM_SEGMENTS });
  const uniqueLabelsWithTextures = [...new Set(segments.map(s => s.label))].filter(label => customTextures[`wheel-${label}`]);


  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center">
      <div
        className="absolute w-full h-full rounded-full"
        style={{
          transition: `transform ${SPIN_DURATION_SECONDS}s cubic-bezier(0.25, 0.1, 0.25, 1)`,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        <svg viewBox="0 0 420 420">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(0,0,0,0.5)" />
            </filter>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
             {fullWheelTexture && (
                <pattern id="pattern-wheel-full" patternUnits="userSpaceOnUse" width="420" height="420" patternTransform={`rotate(${textureRotation} 210 210)`}>
                    <image href={fullWheelTexture} x="0" y="0" width="420" height="420" preserveAspectRatio="xMidYMid slice" />
                </pattern>
            )}
            {uniqueLabelsWithTextures.map(label => (
              <pattern key={`pattern-wheel-${label}`} id={`pattern-wheel-${label}`} patternUnits="userSpaceOnUse" width="420" height="420">
                <image href={customTextures[`wheel-${label}`]} x="0" y="0" width="420" height="420" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>
          <g filter="url(#shadow)">
            {/* Wheel Body */}
            {fullWheelTexture ? (
                <>
                    <circle cx={center} cy={center} r={radius} fill="url(#pattern-wheel-full)" stroke="hsl(43, 78%, 58%)" strokeWidth="2" />
                    {/* Render labels on top of full texture */}
                    {segments.map((segment, index) => {
                        const isBonus = segment.type === 'bonus';
                        const labelPos = getLabelPosition(index, isBonus);
                        return (
                            <text
                                key={segment.id}
                                x={labelPos.x}
                                y={labelPos.y}
                                fill={hideText ? 'transparent' : segment.textColor}
                                textAnchor="middle"
                                dy=".3em"
                                className={cn(
                                    "font-bold uppercase tracking-wider",
                                    isBonus ? "text-[11px] leading-tight" : "text-base"
                                )}
                                style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                                transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${labelPos.x}, ${labelPos.y})`}
                            >
                                {segment.label.replace('_', '\n')}
                            </text>
                        );
                    })}
                </>
            ) : (
                /* Original logic for individual segments */
                segments.map((segment, index) => {
                    const textureUrl = customTextures[`wheel-${segment.label}`];
                    const isBonus = segment.type === 'bonus';
                    const labelPos = getLabelPosition(index, isBonus);
                    return (
                        <g key={segment.id}>
                            <path 
                            d={getSegmentPath(index)} 
                            fill={textureUrl ? `url(#pattern-wheel-${segment.label})` : segment.color} 
                            stroke="hsl(43, 78%, 58%)" 
                            strokeWidth={2}
                            filter={isBonus ? 'url(#glow)' : undefined}
                            />
                            <text
                            x={labelPos.x}
                            y={labelPos.y}
                            fill={hideText || textureUrl ? 'transparent' : segment.textColor}
                            textAnchor="middle"
                            dy=".3em"
                            className={cn(
                                "font-bold uppercase tracking-wider",
                                isBonus ? "text-[11px] leading-tight" : "text-base"
                            )}
                            style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                            transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${labelPos.x}, ${labelPos.y})`}
                            >
                            {segment.label.replace('_', '\n')}
                            </text>
                        </g>
                    );
                })
            )}

            {/* Rim and bulbs */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--accent))" strokeWidth="6" />
            <g>
                {bulbs.map((_, index) => {
                    const angle = index * (360 / bulbs.length);
                    const pos = polarToCartesian(center, center, radius, angle);
                    return (
                        <circle
                            key={`bulb-${index}`}
                            cx={pos.x}
                            cy={pos.y}
                            r="4"
                            fill="hsl(43, 98%, 68%)"
                            className="animate-bulb-blink"
                            style={{ animationDelay: `${(index % 10) * 150}ms`}}
                        />
                    );
                })}
            </g>

          </g>
        </svg>
      </div>
       <div 
         className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-4 border-background flex items-center justify-center shadow-lg"
         style={{ background: 'radial-gradient(circle, hsl(43, 98%, 68%) 60%, hsl(43, 88%, 48%))' }}
       >
       </div>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[15px]"
        style={{
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          width: '30px',
          height: '40px',
          backgroundColor: 'hsl(var(--accent))',
          filter: 'drop-shadow(0px 3px 3px rgba(0,0,0,0.5))',
        }}
      />
    </div>
  );
};


export default function Game() {
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<{[key: string]: number}>(initialBetsState);
  const [betHistory, setBetHistory] = useState<{ optionId: string; amount: number }[]>([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [rotation, setRotation] = useState(0);
  const [aiMessage, setAiMessage] = useState<AiEncouragementOutput | null>(null);
  const { toast } = useToast();
  const [forcedWinner, setForcedWinner] = useState<string | null>(null);
  const [forcedTopSlotLeft, setForcedTopSlotLeft] = useState<string | null>(null);
  const [forcedTopSlotRight, setForcedTopSlotRight] = useState<number | null>(null);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('https://placehold.co/1920x1080.png');
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const textureFileInputRef = useRef<HTMLInputElement>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skipBetsInDataGen, setSkipBetsInDataGen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [customTextures, setCustomTextures] = useState<Record<string, string>>({});
  const [textureUploadTarget, setTextureUploadTarget] = useState<string | null>(null);
  const [isClearTexturesAlertOpen, setIsClearTexturesAlertOpen] = useState(false);
  const [hideText, setHideText] = useState(true);
  const [textureRotation, setTextureRotation] = useState(3.4);
  const [disableAi, setDisableAi] = useState(true);

  const [gameState, setGameState] = useState<'BETTING' | 'SPINNING' | 'RESULT' | 'BONUS_COIN_FLIP' | 'BONUS_PACHINKO' | 'BONUS_CASH_HUNT' | 'BONUS_CRAZY_TIME'>('BETTING');
  const [countdown, setCountdown] = useState(BETTING_TIME_SECONDS);
  const [winningSegment, setWinningSegment] = useState<(typeof SEGMENTS_CONFIG)[0] | null>(null);
  const [spinHistory, setSpinHistory] = useState<((typeof SEGMENTS_CONFIG)[0])[]>([]);
  const spinIdCounter = useRef(0);

  const [isTopSlotSpinning, setIsTopSlotSpinning] = useState(false);
  const [topSlotResult, setTopSlotResult] = useState<{ left: string | null; right: number | null } | null>(null);

  const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const spinDataRef = useRef({ bets, totalBet });
  spinDataRef.current = { bets, totalBet };

  // Load assets from localStorage on initial client-side render
  useEffect(() => {
    try {
      const storedTextures = localStorage.getItem('spinriches_custom_textures');
      if (storedTextures) {
        setCustomTextures(JSON.parse(storedTextures));
      }
      const storedBg = localStorage.getItem('spinriches_custom_bg_image');
      if (storedBg) {
        setBackgroundImage(storedBg);
      }
    } catch (error) {
      console.error("Failed to load assets from localStorage", error);
    }
  }, []);

  const handleClearTextures = () => {
    setCustomTextures({});
    setBackgroundImage('https://placehold.co/1920x1080.png');
    localStorage.removeItem('spinriches_custom_textures');
    localStorage.removeItem('spinriches_custom_bg_image');
    toast({ title: "Assets Cleared", description: "All custom assets have been removed and restored to default." });
    setIsClearTexturesAlertOpen(false);
  };

  const startNewRound = useCallback(() => {
    setGameState('BETTING');
    setCountdown(BETTING_TIME_SECONDS);
    setBets(initialBetsState);
    setBetHistory([]);
    setAiMessage(null);
    setWinningSegment(null);
    setForcedWinner(null);
    setForcedTopSlotLeft(null);
    setForcedTopSlotRight(null);
  }, []);

  useEffect(() => {
    // Set initial random result for Top Slot on component mount
    setTopSlotResult({
      left: TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)],
      right: TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)],
    });
  }, []);

  const handleBet = (optionId: string) => {
    if (gameState !== 'BETTING') return;
    if (balance < selectedChip) {
      toast({ variant: "destructive", title: "Not enough balance to place that bet." });
      return;
    }
    setBalance(prev => prev - selectedChip);
    setBets(prev => ({...prev, [optionId]: prev[optionId] + selectedChip}));
    setBetHistory(prev => [...prev, { optionId, amount: selectedChip }]);
  }

  const handleUndoBet = () => {
    if (gameState !== 'BETTING' || betHistory.length === 0) return;

    const lastBet = betHistory[betHistory.length - 1];
    if (!lastBet) return;

    setBalance(prev => prev + lastBet.amount);

    setBets(prev => ({
      ...prev,
      [lastBet.optionId]: prev[lastBet.optionId] - lastBet.amount
    }));

    setBetHistory(prev => prev.slice(0, -1));
  };

  const handleClearBets = () => {
    if (gameState !== 'BETTING') return;
    setBalance(prev => prev + totalBet);
    setBets(initialBetsState);
    setBetHistory([]);
  }

  const handleDownloadLog = () => {
    if (gameLog.length === 0) {
      toast({ variant: 'destructive', title: 'No game data to download.' });
      return;
    }
    const dataStr = JSON.stringify(gameLog, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `wheel_of_fortune_log_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  
  const handleDownloadLatestSpinData = () => {
    if (gameLog.length === 0) {
      toast({ variant: 'destructive', title: 'No spin data to download.' });
      return;
    }
    const dataStr = JSON.stringify(gameLog[0], null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `latest_spin_data_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleBgImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setBackgroundImage(result);
          try {
            localStorage.setItem('spinriches_custom_bg_image', result);
          } catch (error) {
            console.error("Failed to save background image to localStorage", error);
            toast({ variant: "destructive", title: "Storage Error", description: "Could not save background image. Storage might be full." });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = (target: string) => {
    if (target === 'background') {
        bgFileInputRef.current?.click();
    } else {
        setTextureUploadTarget(target);
        textureFileInputRef.current?.click();
    }
  };

  const handleTextureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && textureUploadTarget) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const newTextures = { ...customTextures, [textureUploadTarget]: result };
          setCustomTextures(newTextures);
          try {
              localStorage.setItem('spinriches_custom_textures', JSON.stringify(newTextures));
          } catch (error) {
              console.error("Failed to save textures to localStorage", error);
              toast({ variant: "destructive", title: "Storage Error", description: "Could not save textures. Storage might be full." });
          }
        }
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = "";
    }
    setTextureUploadTarget(null);
  };

  const handleSkipCountdown = () => {
    if (gameState !== 'BETTING') return;
    setCountdown(0);
  }

  const handleCloseRound = () => {
    startNewRound();
  };

  const handleBonusComplete = useCallback(async (bonusWinnings: number, bonusDetails?: any) => {
    if (!winningSegment) return;
    const winningLabel = winningSegment.label;
    const betOnWinner = spinDataRef.current.bets[winningLabel] || 0;
    const roundWinnings = betOnWinner + bonusWinnings;
    const currentTotalBet = spinDataRef.current.totalBet;

    setBalance(prev => prev + roundWinnings);

    if (disableAi) {
        setAiMessage({ message: "What a bonus round!", encouragementLevel: 'high' });
    } else {
        try {
            const encouragement = await getEncouragement({
                gameEvent: 'win',
                betAmount: currentTotalBet,
                winAmount: roundWinnings,
            });
            setAiMessage(encouragement);
        } catch (error) {
            console.error("AI encouragement error:", error);
            setAiMessage({ message: "What a bonus round!", encouragementLevel: 'high' });
        }
    }
    
    setGameLog(prevLog => {
        const updatedLog = [...prevLog];
        const spinLogIndex = updatedLog.findIndex(log => log.spinId === spinIdCounter.current);
        if (spinLogIndex > -1) {
            updatedLog[spinLogIndex] = {
                ...updatedLog[spinLogIndex],
                bonusWinnings: bonusWinnings,
                bonusDetails: bonusDetails,
                roundWinnings: roundWinnings,
                netResult: roundWinnings - updatedLog[spinLogIndex].totalBet,
            };
        }
        return updatedLog;
    });

    setGameState('RESULT');
  }, [winningSegment, disableAi]);

  const handleSpin = useCallback(async () => {
    setGameState('SPINNING');
    setAiMessage(null);
    spinIdCounter.current++;


    // --- Top Slot Logic ---
    const finalTopSlotResult = {
        left: forcedTopSlotLeft ?? TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)],
        right: forcedTopSlotRight ?? TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)],
    };

    // Set the final result first, so the animation knows where to go.
    setTopSlotResult(finalTopSlotResult);
    // Then, trigger the animation.
    setIsTopSlotSpinning(true);
    
    // After the animation is done, set spinning to false.
    // This allows the component to reset its animation state without visual glitches.
    setTimeout(() => {
        setIsTopSlotSpinning(false);
    }, TOP_SLOT_ANIMATION_DURATION_MS);


    // --- Main Wheel Logic ---
    let winningSegmentIndex;
    if (forcedWinner) {
      const possibleIndices = SEGMENTS_CONFIG.reduce((acc, segment, index) => {
        if (segment.label === forcedWinner) {
          acc.push(index);
        }
        return acc;
      }, [] as number[]);
      
      if (possibleIndices.length > 0) {
        winningSegmentIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
      } else {
        winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
      }
      setForcedWinner(null);
    } else {
      winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    }
    
    const currentWinningSegment = SEGMENTS_CONFIG[winningSegmentIndex];
    
    const fullSpins = 7 * 360;
    const targetAngle = (winningSegmentIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
    
    setRotation(prev => {
      const currentOffset = prev % 360;
      return prev - currentOffset + fullSpins + (360 - targetAngle);
    });
    
    setTimeout(async () => {
      const { bets: currentBets, totalBet: currentTotalBet } = spinDataRef.current;
      const winningLabel = currentWinningSegment.label;
      const betOnWinner = currentBets[winningLabel] || 0;

      const rightIndex = finalTopSlotResult.right !== null
        ? TOP_SLOT_RIGHT_REEL_ITEMS.findIndex(item => item === finalTopSlotResult.right)
        : null;

      if (currentWinningSegment.type === 'bonus') {
          const isBonusWin = betOnWinner > 0;
          if (!isBonusWin) {
               if (disableAi) {
                   setAiMessage({ message: "Good luck next time!", encouragementLevel: 'low' });
               } else {
                   try {
                      const encouragement = await getEncouragement({
                          gameEvent: 'loss',
                          betAmount: currentTotalBet,
                          winAmount: 0,
                      });
                      setAiMessage(encouragement);
                  } catch (error) {
                      console.error("AI encouragement error:", error);
                      setAiMessage({ message: "Good luck next time!", encouragementLevel: 'low' });
                  }
               }
          }
          
          const newLogEntry: GameLogEntry = {
              spinId: spinIdCounter.current,
              timestamp: new Date().toISOString(),
              bets: currentBets,
              totalBet: currentTotalBet,
              winningSegment: { 
                label: currentWinningSegment.label, 
                type: currentWinningSegment.type, 
                multiplier: 0,
                index: BET_OPTION_INDEX_MAP[currentWinningSegment.label]!
              },
              topSlotResult: finalTopSlotResult ? {
                ...finalTopSlotResult,
                leftIndex: finalTopSlotResult.left ? BET_OPTION_INDEX_MAP[finalTopSlotResult.left]! : null,
                rightIndex: rightIndex !== -1 ? rightIndex : null,
              } : null,
              isBonus: true,
              roundWinnings: 0, // This will be updated in handleBonusComplete
              netResult: -currentTotalBet, // This will be updated in handleBonusComplete
          };
          setGameLog(prev => [newLogEntry, ...prev]);
          
          setWinningSegment(currentWinningSegment);
          setSpinHistory(prev => [currentWinningSegment, ...prev].slice(0, 7));

          if (isBonusWin) {
              setGameState(`BONUS_${winningLabel}` as any);
          } else {
              setGameState('RESULT');
          }
          return;
      }
      
      let roundWinnings = 0;
      if (betOnWinner > 0) {
        let effectiveMultiplier = currentWinningSegment.multiplier;
        if (finalTopSlotResult && finalTopSlotResult.left === currentWinningSegment.label && finalTopSlotResult.right) {
            effectiveMultiplier = finalTopSlotResult.right;
        }
        roundWinnings = betOnWinner * effectiveMultiplier + betOnWinner;
      }
      
      setBalance(prev => prev + roundWinnings);

      if (currentTotalBet > 0) {
        if (disableAi) {
            setAiMessage({ message: "Good luck on the next spin!", encouragementLevel: 'low' });
        } else {
            try {
              const encouragement = await getEncouragement({
                gameEvent: roundWinnings > currentTotalBet ? 'win' : 'loss',
                betAmount: currentTotalBet,
                winAmount: roundWinnings,
              });
              setAiMessage(encouragement);
            } catch (error) {
              console.error("AI encouragement error:", error);
              setAiMessage({ message: "Good luck on the next spin!", encouragementLevel: 'low' });
            }
        }
      }
      
      const newLogEntry: GameLogEntry = {
          spinId: spinIdCounter.current,
          timestamp: new Date().toISOString(),
          bets: currentBets,
          totalBet: currentTotalBet,
          winningSegment: { 
            label: currentWinningSegment.label, 
            type: currentWinningSegment.type, 
            multiplier: currentWinningSegment.multiplier,
            index: BET_OPTION_INDEX_MAP[currentWinningSegment.label]!
          },
          topSlotResult: finalTopSlotResult ? {
            ...finalTopSlotResult,
            leftIndex: finalTopSlotResult.left ? BET_OPTION_INDEX_MAP[finalTopSlotResult.left]! : null,
            rightIndex: rightIndex !== -1 ? rightIndex : null,
          } : null,
          isBonus: false,
          roundWinnings: roundWinnings,
          netResult: roundWinnings - currentTotalBet,
      };
      setGameLog(prev => [newLogEntry, ...prev]);
      
      setWinningSegment(currentWinningSegment);
      setSpinHistory(prev => [currentWinningSegment, ...prev].slice(0, 7));
      setGameState('RESULT');

    }, SPIN_DURATION_SECONDS * 1000);
  }, [forcedWinner, forcedTopSlotLeft, forcedTopSlotRight, disableAi]);

  // Game Loop Timer
  useEffect(() => {
    if (isPaused) {
      return;
    }
    let timer: NodeJS.Timeout;

    if (gameState === 'BETTING') {
      if (countdown <= 0) {
        handleSpin();
      } else {
        timer = setTimeout(() => {
          setCountdown(c => c - 1);
        }, 1000);
      }
    } else if (gameState === 'RESULT') {
      timer = setTimeout(() => {
        startNewRound();
      }, RESULT_DISPLAY_SECONDS * 1000);
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown, handleSpin, isPaused, startNewRound]);
  
  const generateHourOfData = () => {
    const NUM_SPINS_IN_HOUR = 120; // Approximate
    const generatedLog: GameLogEntry[] = [];
    const MAX_MULTIPLIER = 20000;

    const INITIAL_CRAZY_TIME_SEGMENTS: { value: number | 'DOUBLE' | 'TRIPLE', color: string }[] = [ { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, ];

    // Helper to simulate random bets
    const simulateRandomBets = () => {
        const bets: { [key: string]: number } = { ...initialBetsState };
        let totalBet = 0;
        const numBets = Math.floor(Math.random() * 4) + 1; // 1 to 4 bets
        const betOptionsCopy = [...BET_OPTIONS];

        for (let i = 0; i < numBets; i++) {
            if (betOptionsCopy.length === 0) break;
            const randIndex = Math.floor(Math.random() * betOptionsCopy.length);
            const betOption = betOptionsCopy.splice(randIndex, 1)[0];
            const chipValue = CHIP_VALUES[Math.floor(Math.random() * CHIP_VALUES.length)];
            bets[betOption.id] += chipValue;
            totalBet += chipValue;
        }
        return { bets, totalBet };
    };

    const simulateCoinFlip = (betAmount: number) => {
        const MULTIPLIERS = [2, 3, 4, 5, 10, 15, 20, 25, 50, 100];
        const shuffled = [...MULTIPLIERS].sort(() => 0.5 - Math.random());
        const multipliers = { red: shuffled[0], blue: shuffled[1] };
        const result = Math.random() < 0.5 ? 'red' : 'blue';
        const winningMultiplier = result === 'red' ? multipliers.red : multipliers.blue;
        const winnings = betAmount * winningMultiplier;
        return { bonusWinnings: winnings, bonusDetails: { coinFlipMultipliers: multipliers } };
    };
    
    const simulatePachinko = (betAmount: number) => {
        let currentMultipliers: (number | 'DOUBLE')[] = [5, 10, 15, 'DOUBLE', 25, 'DOUBLE', 15, 10, 5];
        const dropHistory: (number | 'DOUBLE')[] = [];
        let finalMultiplier = 0;

        while (true) {
            const dropIndex = Math.floor(Math.random() * currentMultipliers.length);
            const result = currentMultipliers[dropIndex];
            dropHistory.push(result);
            if (result === 'DOUBLE') {
                 if (dropHistory.filter(d => d === 'DOUBLE').length > 2) {
                    const numberMultipliers = currentMultipliers.filter(m => typeof m === 'number') as number[];
                    finalMultiplier = numberMultipliers[Math.floor(Math.random() * numberMultipliers.length)];
                    break;
                 }
                currentMultipliers = currentMultipliers.map(m => (typeof m === 'number' ? Math.min(m * 2, MAX_MULTIPLIER) : 'DOUBLE'));
            } else {
                finalMultiplier = result;
                break;
            }
        }
        const winnings = betAmount * finalMultiplier;
        return { bonusWinnings: winnings, bonusDetails: { pachinkoDropHistory: dropHistory, pachinkoFinalMultipliers: currentMultipliers } };
    };
    
    const simulateCashHunt = (betAmount: number) => {
        const generateMultipliers = () => {
             const multipliers = [ 100, 75, 50, 50, ...Array(10).fill(25), ...Array(14).fill(20), ...Array(20).fill(15), ...Array(20).fill(10), ...Array(20).fill(7), ...Array(20).fill(5), ];
            return multipliers.sort(() => Math.random() - 0.5);
        };
        const multipliers = generateMultipliers();
        const selectedMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
        const winnings = betAmount * selectedMultiplier;
        return { bonusWinnings: winnings, bonusDetails: { cashHuntMultipliers: multipliers } };
    };

    const simulateCrazyTime = (betAmount: number) => {
        let currentSegments = [...INITIAL_CRAZY_TIME_SEGMENTS];
        const spinHistory: (string | number)[] = [];
        let finalMultiplier = 0;

        while(true) {
            const winningSegment = currentSegments[Math.floor(Math.random() * currentSegments.length)];
            spinHistory.push(winningSegment.value);
            if (winningSegment.value === 'DOUBLE' || winningSegment.value === 'TRIPLE') {
                if (spinHistory.filter(d => typeof d === 'string').length > 2) {
                    const numberSegments = currentSegments.filter(s => typeof s.value === 'number').map(s => s.value as number);
                    finalMultiplier = numberSegments[Math.floor(Math.random() * numberSegments.length)];
                    break;
                }
                const multiplier = winningSegment.value === 'DOUBLE' ? 2 : 3;
                currentSegments = currentSegments.map(seg => ({ ...seg, value: typeof seg.value === 'number' ? Math.min(seg.value * multiplier, MAX_MULTIPLIER) : seg.value, }));
            } else {
                finalMultiplier = winningSegment.value as number;
                break;
            }
        }
        const winnings = betAmount * finalMultiplier;
        return { bonusWinnings: winnings, bonusDetails: { selectedFlapper: ['green', 'blue', 'yellow'][Math.floor(Math.random()*3)] as 'green' | 'blue' | 'yellow', spinHistory, finalSegments: currentSegments.map(s => s.value) }};
    };

    for (let i = 0; i < NUM_SPINS_IN_HOUR; i++) {
        const spinId = Date.now() + i;
        const { bets: currentBets, totalBet: currentTotalBet } = skipBetsInDataGen
            ? { bets: { ...initialBetsState }, totalBet: 0 }
            : simulateRandomBets();

        const topSlotResult = {
            left: TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)],
            right: TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)],
        };
        const rightIndex = topSlotResult.right !== null ? TOP_SLOT_RIGHT_REEL_ITEMS.findIndex(item => item === topSlotResult.right) : null;
        
        const winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
        const winningSegment = SEGMENTS_CONFIG[winningSegmentIndex];

        let logEntry: Omit<GameLogEntry, 'roundWinnings' | 'netResult'> & { roundWinnings?: number; netResult?: number } = {
            spinId,
            timestamp: new Date(Date.now() - (NUM_SPINS_IN_HOUR - i) * 45 * 1000).toISOString(),
            bets: currentBets,
            totalBet: currentTotalBet,
            winningSegment: {
                label: winningSegment.label,
                type: winningSegment.type,
                multiplier: winningSegment.type === 'number' ? winningSegment.multiplier : 0,
                index: BET_OPTION_INDEX_MAP[winningSegment.label]!,
            },
            topSlotResult: {
                ...topSlotResult,
                leftIndex: topSlotResult.left ? BET_OPTION_INDEX_MAP[topSlotResult.left]! : null,
                rightIndex: rightIndex !== -1 ? rightIndex : null,
            },
            isBonus: winningSegment.type === 'bonus',
        };

        let roundWinnings = 0;
        const betOnWinner = currentBets[winningSegment.label] || 0;

        if (winningSegment.type === 'bonus') {
            if (betOnWinner > 0) {
                let bonusResult;
                switch (winningSegment.label) {
                    case 'COIN_FLIP':
                        bonusResult = simulateCoinFlip(betOnWinner);
                        break;
                    case 'PACHINKO':
                         bonusResult = simulatePachinko(betOnWinner);
                        break;
                    case 'CASH_HUNT':
                         bonusResult = simulateCashHunt(betOnWinner);
                        break;
                    case 'CRAZY_TIME':
                         bonusResult = simulateCrazyTime(betOnWinner);
                        break;
                    default:
                        bonusResult = { bonusWinnings: 0, bonusDetails: {} };
                }
                logEntry.bonusWinnings = bonusResult.bonusWinnings;
                logEntry.bonusDetails = bonusResult.bonusDetails;
                roundWinnings = betOnWinner + bonusResult.bonusWinnings;
            }
        } else {
             if (betOnWinner > 0) {
                let effectiveMultiplier = winningSegment.multiplier;
                if (topSlotResult && topSlotResult.left === winningSegment.label && topSlotResult.right) {
                    effectiveMultiplier = topSlotResult.right;
                }
                roundWinnings = betOnWinner * effectiveMultiplier + betOnWinner;
            }
        }

        logEntry.roundWinnings = roundWinnings;
        logEntry.netResult = roundWinnings - currentTotalBet;

        generatedLog.push(logEntry as GameLogEntry);
    }
    
    // Download the log
    const dataStr = JSON.stringify(generatedLog, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const downloadLink = document.createElement('a');
    downloadLink.setAttribute('href', dataUri);
    downloadLink.setAttribute('download', `wheel_of_fortune_1_hour_log_${new Date().toISOString()}.json`);
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleGenerateAndDownload = () => {
      setIsGenerating(true);
      toast({ title: "Generating Data...", description: "Please wait, this may take a moment." });
      
      setTimeout(() => {
          try {
              generateHourOfData();
              toast({ title: "Success!", description: "Your data is downloading." });
          } catch(e) {
              console.error(e);
              toast({ variant: 'destructive', title: "Error", description: "Failed to generate data." });
          } finally {
              setIsGenerating(false);
          }
      }, 50);
  }

  const aiMessageColor = {
    low: 'text-muted-foreground',
    medium: 'text-foreground',
    high: 'text-accent',
  };

  const isBonusActive = gameState.startsWith('BONUS_');
  const hasCustomAssets = Object.keys(customTextures).length > 0 || !backgroundImage.startsWith('https://placehold.co');
  
  return (
    <div className="relative flex flex-col h-screen text-foreground overflow-hidden">
      <Image
        alt="Carnival background"
        src={backgroundImage}
        data-ai-hint="carnival night"
        fill
        className="object-cover z-[-2]"
        priority
      />
      <div className="absolute inset-0 bg-background/80 z-[-1]"></div>
      
      {gameState === 'BETTING' && !isPaused && (() => {
          const radius = 40;
          const circumference = 2 * Math.PI * radius;
          const progressPercentage = Math.max(0, countdown) / BETTING_TIME_SECONDS;
          const strokeDashoffset = circumference - (progressPercentage * circumference);

          const getTimerColor = () => {
              if (countdown <= 4) return 'text-red-500';
              if (countdown <= 10) return 'text-yellow-500';
              return 'text-green-500';
          };

          return (
              <div className="fixed top-20 left-4 z-50">
                  <div className="relative h-24 w-24">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                              className="stroke-current text-foreground/20"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r={radius}
                              cx="50"
                              cy="50"
                          />
                          {/* Progress circle */}
                          <circle
                              className={cn(
                                  "stroke-current",
                                  getTimerColor()
                              )}
                              strokeWidth="8"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r={radius}
                              cx="50"
                              cy="50"
                              transform="rotate(-90 50 50)"
                              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease-in-out' }}
                          />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-3xl font-headline text-foreground">{Math.max(0, countdown)}</span>
                      </div>
                  </div>
              </div>
          );
      })()}

      <AlertDialog open={isClearTexturesAlertOpen} onOpenChange={setIsClearTexturesAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action will permanently remove all uploaded custom assets (background and textures) and restore the default appearance. This cannot be undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearTextures} className={buttonVariants({ variant: "destructive" })}>Confirm & Clear</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {gameState === 'BONUS_COIN_FLIP' && <CoinFlipBonus betAmount={bets['COIN_FLIP']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_PACHINKO' && <PachinkoBonus betAmount={bets['PACHINKO']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CASH_HUNT' && <CashHuntBonus betAmount={bets['CASH_HUNT']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CRAZY_TIME' && <CrazyTimeBonus betAmount={bets['CRAZY_TIME']} onComplete={handleBonusComplete} />}

      {!isBonusActive && (
        <div className="flex flex-col flex-grow h-full">
          <header className="w-full flex justify-between items-center px-4 py-2 shrink-0">
            <div className="flex items-center gap-4">
              <Card className="p-2 px-4 bg-card/50 backdrop-blur-sm border-accent/30">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Wallet className="text-accent" />
                  <span>${balance.toLocaleString()}</span>
                </div>
              </Card>
            </div>
             {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <Button variant="outline" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Exit Guest Mode
                </Button>
            )}
          </header>

          <main className="flex-grow flex items-center justify-center gap-8 px-4 overflow-hidden">
            {/* Left Column: Wheel and Game elements */}
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="my-4 z-20">
                    <TopSlot isSpinning={isTopSlotSpinning} result={topSlotResult} customTextures={customTextures} hideText={hideText} />
                </div>
                
                <div className="relative flex flex-col items-center">
                    <Wheel segments={SEGMENTS_CONFIG} rotation={rotation} customTextures={customTextures} hideText={hideText} textureRotation={textureRotation} />
                    <div className="relative -mt-[60px] w-80 h-24 z-[-1]">
                        <div
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 h-[50px] w-48"
                        style={{
                            background: 'linear-gradient(to right, hsl(var(--secondary) / 0.8), hsl(var(--secondary)), hsl(var(--secondary) / 0.8))',
                            clipPath: 'polygon(40% 0, 60% 0, 90% 100%, 10% 100%)',
                            filter: 'drop-shadow(0px -3px 8px rgba(0,0,0,0.4))'
                        }}
                        >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
                        </div>
                        
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[250px] h-8">
                            <div
                                className="absolute bottom-0 left-0 w-full h-[85%] rounded-b-lg"
                                style={{
                                    background: 'linear-gradient(to top, hsl(var(--primary)/0.7), hsl(var(--primary)/0.9))',
                                    boxShadow: '0 10px 15px -5px rgba(0,0,0,0.7)',
                                }}
                            />
                            <div
                                className="absolute top-0 left-0 w-full h-4 rounded-[100%_/_100%]"
                                style={{
                                    background: 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary)/0.8))',
                                    border: '2px solid hsl(var(--accent)/0.3)',
                                    boxShadow: 'inset 0 2px 4px hsl(var(--accent)/0.2)',
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-20 flex items-center justify-center">
                    <Card className="bg-card/50 backdrop-blur-sm border-accent/30 p-2 shadow-lg">
                        <CardContent className="p-0 flex items-center gap-3">
                            <p className="text-sm font-bold pr-3 border-r border-muted-foreground/50 self-stretch flex items-center text-muted-foreground">
                                History
                            </p>
                            <div className="flex gap-1.5">
                                {spinHistory.map((segment, index) => {
                                    const customTexture = customTextures[`history-${segment.label}`];
                                    const style: React.CSSProperties = {
                                        backgroundColor: segment.color,
                                        color: segment.textColor,
                                        textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
                                    };

                                    if (customTexture) {
                                        style.backgroundImage = `url(${customTexture})`;
                                        style.backgroundSize = 'cover';
                                        style.backgroundPosition = 'center';
                                        style.color = 'transparent';
                                    }

                                    return (
                                        <div
                                            key={`${segment.id}-${index}`}
                                            className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shadow-inner transition-all animate-in fade-in"
                                            style={style}
                                            title={segment.label.replace('_', ' ')}
                                        >
                                            <span className="text-center leading-tight">
                                                {segment.label.replace('_', '\n')}
                                            </span>
                                        </div>
                                    );
                                })}
                                {[...Array(Math.max(0, 7 - spinHistory.length))].map((_, i) => (
                                    <div key={`placeholder-${i}`} className="w-10 h-10 rounded-md bg-background/30" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Right Column: Betting and Info */}
            <div className="flex flex-col justify-center gap-4 w-full max-w-lg">
                <div className="h-32 flex flex-col items-center justify-center text-center gap-4">
                    <div className="flex-grow flex items-center justify-center">
                        {gameState === 'BETTING' && (
                        <h2 className="text-xl font-bold uppercase tracking-wider text-accent">
                            {isPaused ? 'GAME PAUSED' : 'Place Your Bets'}
                        </h2>
                        )}
                        {gameState === 'SPINNING' && (
                            <h2 className="text-2xl font-bold uppercase tracking-wider text-accent animate-pulse">
                                No More Bets!
                            </h2>
                        )}
                        {gameState === 'RESULT' && winningSegment && (
                            <>
                                <h2 className="text-xl font-bold uppercase tracking-wider text-foreground mb-2">
                                    {isPaused ? 'GAME PAUSED' : 'Winner is...'}
                                </h2>
                                <p className="text-4xl font-headline text-accent">{winningSegment.label.replace('_', ' ')}</p>
                            </>
                        )}
                    </div>
                    {aiMessage && gameState === 'RESULT' && (
                        <Card className={cn("bg-card/50 backdrop-blur-sm border-accent/30 p-3 transition-all duration-500 flex-shrink-0", gameState === 'SPINNING' ? "opacity-0" : "opacity-100")}>
                            <CardContent className="p-0 flex items-center gap-3">
                            <Sparkles className="text-accent w-5 h-5"/>
                            <p className={cn("text-base", aiMessageColor[aiMessage.encouragementLevel])}>
                                {aiMessage.message}
                            </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

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
                            )})}
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
                            <Button variant="ghost" size="icon" onClick={handleUndoBet} disabled={gameState !== 'BETTING' || betHistory.length === 0 || isPaused}><RotateCcw className="w-5 h-5"/></Button>
                            <Button variant="ghost" size="icon" onClick={handleClearBets} disabled={gameState !== 'BETTING' || totalBet === 0 || isPaused}><XCircle className="w-5 h-5"/></Button>
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
            </div>
          </main>

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
                        <Button variant="outline" size="sm" onClick={() => setIsClearTexturesAlertOpen(true)} disabled={!hasCustomAssets}>
                            <Trash2 className="mr-2 h-3 w-3" />
                            Clear Assets
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
                        id="disable-ai" 
                        checked={disableAi} 
                        onCheckedChange={(checked) => setDisableAi(Boolean(checked))}
                    />
                    <label
                        htmlFor="disable-ai"
                        className="text-xs font-medium text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Disable AI Encouragement (avoids rate limits)
                    </label>
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
        </div>
      )}
    </div>
  );
}
