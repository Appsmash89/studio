
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Wallet, Sparkles, XCircle, Download, FastForward, RotateCcw, Upload, Play, Pause, TestTube2, BookCopy, FileClock, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from '@/components/ui/checkbox';
import { CoinFlipBonus } from '@/components/bonus/coin-flip-bonus';
import { PachinkoBonus } from '@/components/bonus/pachinko-bonus';
import { CashHuntBonus } from '@/components/bonus/cash-hunt-bonus';
import { CrazyTimeBonus } from '@/components/bonus/crazy-time-bonus';
import { TopSlot, TOP_SLOT_RIGHT_REEL_ITEMS } from '@/components/top-slot';


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
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 1
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 1
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 2
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 1
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' }, // 1
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 2
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 3
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' }, // 1
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 3
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 4
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 2
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 5
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 4
    { label: 'PACHINKO', type: 'bonus', multiplier: 0, color: 'hsl(320, 70%, 60%)' }, // 1
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 6
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 5
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 7
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 3
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 8
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 6
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' }, // 2
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 9
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' }, // 2
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 7
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 10
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 4
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 11
    { label: 'CASH_HUNT', type: 'bonus', multiplier: 0, color: 'hsl(100, 60%, 60%)' }, // 1
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 8
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 12
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 5
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 13
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 9
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' }, // 3
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 14
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' }, // 3
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 10
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 15
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 6
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 16
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 11
    { label: 'CRAZY_TIME', type: 'bonus', multiplier: 0, color: 'hsl(0, 80%, 60%)' }, // 1
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 17
    { label: 'PACHINKO', type: 'bonus', multiplier: 0, color: 'hsl(320, 70%, 60%)' }, // 2
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 12
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 18
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' }, // 4
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 19
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' }, // 7
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 20
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' }, // 4
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' }, // 13
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' }, // 21
    { label: 'CASH_HUNT', type: 'bonus', multiplier: 0, color: 'hsl(100, 60%, 60%)' }, // 2
].map(seg => ({ ...seg, textColor: textColorMap[seg.label]! }));


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

const Wheel = ({ segments, rotation, customTextures }: { segments: typeof SEGMENTS_CONFIG; rotation: number; customTextures: Record<string, string> }) => {
  const radius = 200;
  const center = 210;

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

  const getLabelPosition = (index: number) => {
    const angle = (index + 0.5) * SEGMENT_ANGLE;
    return polarToCartesian(center, center, radius * 0.7, angle);
  };
  
  const bulbs = Array.from({ length: NUM_SEGMENTS });

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
            {Object.entries(customTextures).map(([id, url]) => (
              <pattern key={`pattern-${id}`} id={`pattern-${id}`} patternUnits="userSpaceOnUse" width="420" height="420">
                <image href={url} x="0" y="0" width="420" height="420" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            ))}
          </defs>
          <g filter="url(#shadow)">
            {/* Segments */}
            {segments.map((segment, index) => {
              const textureUrl = customTextures[segment.label];
              return (
              <g key={index}>
                <path 
                  d={getSegmentPath(index)} 
                  fill={textureUrl ? `url(#pattern-${segment.label})` : segment.color} 
                  stroke="hsl(43, 78%, 58%)" 
                  strokeWidth="2" 
                  filter={segment.type === 'bonus' ? 'url(#glow)' : undefined}
                />
                <text
                  x={getLabelPosition(index).x}
                  y={getLabelPosition(index).y}
                  fill={textureUrl ? 'transparent' : segment.textColor}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-lg font-bold uppercase tracking-wider"
                  style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                  transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${getLabelPosition(index).x}, ${getLabelPosition(index).y})`}
                >
                  {segment.label.replace('_', '\n')}
                </text>
              </g>
            )})}

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
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<{[key: string]: number}>(initialBetsState);
  const [betHistory, setBetHistory] = useState<{ optionId: string; amount: number }[]>([]);
  const [selectedChip, setSelectedChip] = useState(10);
  const [rotation, setRotation] = useState(0);
  const [aiMessage, setAiMessage] = useState<AiEncouragementOutput | null>(null);
  const { toast } = useToast();
  const [forcedWinner, setForcedWinner] = useState<string | null>(null);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [backgroundImage, setBackgroundImage] = useState('https://placehold.co/1920x1080.png');
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const textureFileInputRef = useRef<HTMLInputElement>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skipBetsInDataGen, setSkipBetsInDataGen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [customTextures, setCustomTextures] = useState<Record<string, string>>({});
  const [textureUploadTarget, setTextureUploadTarget] = useState<string | null>(null);

  const [gameState, setGameState] = useState<'BETTING' | 'SPINNING' | 'RESULT' | 'BONUS_COIN_FLIP' | 'BONUS_PACHINKO' | 'BONUS_CASH_HUNT' | 'BONUS_CRAZY_TIME'>('BETTING');
  const [countdown, setCountdown] = useState(BETTING_TIME_SECONDS);
  const [winningSegment, setWinningSegment] = useState<(typeof SEGMENTS_CONFIG)[0] & { id: number } | null>(null);
  const [spinHistory, setSpinHistory] = useState<((typeof SEGMENTS_CONFIG)[0] & { id: number })[]>([]);
  const spinIdCounter = useRef(0);

  const [isTopSlotSpinning, setIsTopSlotSpinning] = useState(false);
  const [topSlotResult, setTopSlotResult] = useState<{ left: string | null; right: number | null } | null>(null);

  const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const spinDataRef = useRef({ bets, totalBet });
  spinDataRef.current = { bets, totalBet };

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
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && textureUploadTarget) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setCustomTextures(prev => ({ ...prev, [textureUploadTarget]: result }));
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

  const handleBonusComplete = useCallback(async (bonusWinnings: number, bonusDetails?: any) => {
    const winningLabel = winningSegment!.label;
    const betOnWinner = spinDataRef.current.bets[winningLabel] || 0;
    const roundWinnings = betOnWinner + bonusWinnings;
    const currentTotalBet = spinDataRef.current.totalBet;

    setBalance(prev => prev + roundWinnings);

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
    
    setGameLog(prevLog => {
        const updatedLog = [...prevLog];
        const spinLogIndex = updatedLog.findIndex(log => log.spinId === winningSegment!.id);
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
  }, [winningSegment]);

  const handleSpin = useCallback(async () => {
    setGameState('SPINNING');
    setAiMessage(null);

    // --- Top Slot Logic ---
    const finalTopSlotResult = {
        left: TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)],
        right: TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)],
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
    const winningSegmentWithId = { ...currentWinningSegment, id: ++spinIdCounter.current };
    
    const fullSpins = 7 * 360;
    const targetAngle = (winningSegmentIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
    
    setRotation(prev => {
      const currentOffset = prev % 360;
      return prev - currentOffset + fullSpins + (360 - targetAngle);
    });
    
    setTimeout(async () => {
      const { bets: currentBets, totalBet: currentTotalBet } = spinDataRef.current;
      const winningLabel = winningSegmentWithId.label;
      const betOnWinner = currentBets[winningLabel] || 0;

      const rightIndex = finalTopSlotResult.right !== null
        ? TOP_SLOT_RIGHT_REEL_ITEMS.findIndex(item => item === finalTopSlotResult.right)
        : null;

      if (winningSegmentWithId.type === 'bonus') {
          const isBonusWin = betOnWinner > 0;
          if (!isBonusWin) {
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
          
          const newLogEntry: GameLogEntry = {
              spinId: winningSegmentWithId.id,
              timestamp: new Date().toISOString(),
              bets: currentBets,
              totalBet: currentTotalBet,
              winningSegment: { 
                label: winningSegmentWithId.label, 
                type: winningSegmentWithId.type, 
                multiplier: 0,
                index: BET_OPTION_INDEX_MAP[winningSegmentWithId.label]!
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
          
          setWinningSegment(winningSegmentWithId);
          setSpinHistory(prev => [winningSegmentWithId, ...prev].slice(0, 7));

          if (isBonusWin) {
              setGameState(`BONUS_${winningLabel}` as any);
          } else {
              setGameState('RESULT');
          }
          return;
      }
      
      let roundWinnings = 0;
      if (betOnWinner > 0) {
        let effectiveMultiplier = winningSegmentWithId.multiplier;
        if (finalTopSlotResult && finalTopSlotResult.left === winningSegmentWithId.label && finalTopSlotResult.right) {
            effectiveMultiplier = finalTopSlotResult.right;
        }
        roundWinnings = betOnWinner * effectiveMultiplier + betOnWinner;
      }
      
      setBalance(prev => prev + roundWinnings);

      if (currentTotalBet > 0) {
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
      
      const newLogEntry: GameLogEntry = {
          spinId: winningSegmentWithId.id,
          timestamp: new Date().toISOString(),
          bets: currentBets,
          totalBet: currentTotalBet,
          winningSegment: { 
            label: winningSegmentWithId.label, 
            type: winningSegmentWithId.type, 
            multiplier: winningSegmentWithId.multiplier,
            index: BET_OPTION_INDEX_MAP[winningSegmentWithId.label]!
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
      
      setWinningSegment(winningSegmentWithId);
      setSpinHistory(prev => [winningSegmentWithId, ...prev].slice(0, 7));
      setGameState('RESULT');

    }, SPIN_DURATION_SECONDS * 1000);
  }, [forcedWinner]);

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
        setGameState('BETTING');
        setCountdown(BETTING_TIME_SECONDS);
        setBets(initialBetsState);
        setBetHistory([]);
        setAiMessage(null);
        setWinningSegment(null);
      }, RESULT_DISPLAY_SECONDS * 1000);
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown, handleSpin, isPaused]);
  
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
  
  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen text-foreground p-4 overflow-hidden">
      <Image
        alt="Carnival background"
        src={backgroundImage}
        data-ai-hint="carnival night"
        fill
        className="object-cover z-[-2]"
        priority
      />
      <div className="absolute inset-0 bg-background/80 z-[-1]"></div>
      
      {gameState === 'BONUS_COIN_FLIP' && <CoinFlipBonus betAmount={bets['COIN_FLIP']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_PACHINKO' && <PachinkoBonus betAmount={bets['PACHINKO']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CASH_HUNT' && <CashHuntBonus betAmount={bets['CASH_HUNT']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CRAZY_TIME' && <CrazyTimeBonus betAmount={bets['CRAZY_TIME']} onComplete={handleBonusComplete} />}

      {!isBonusActive && (
        <>
          <header className="w-full flex justify-between items-center absolute top-4 px-4">
            <div className="flex items-center gap-4">
              <Card className="p-2 px-4 bg-card/50 backdrop-blur-sm border-accent/30">
                <div className="flex items-center gap-2 text-xl font-bold">
                  <Wallet className="text-accent" />
                  <span>${balance.toLocaleString()}</span>
                </div>
              </Card>
            </div>
          </header>

          <main className="flex flex-col items-center justify-center gap-4 pt-20">
            <h1 className="text-4xl sm:text-5xl font-headline text-accent tracking-wider text-center" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
              Wheel of Fortune Casino – Free Spins
            </h1>
            
            <div className="h-24 flex flex-col items-center justify-center text-center">
                {gameState === 'BETTING' && (
                    <>
                        <h2 className="text-xl font-bold uppercase tracking-wider text-accent mb-2">
                           {isPaused ? 'GAME PAUSED' : 'Place Your Bets'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <p className="text-4xl font-headline">{countdown}</p>
                        </div>
                        <Progress value={(countdown / BETTING_TIME_SECONDS) * 100} className="w-64 mt-2" />
                    </>
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

            <div className="my-4 z-20">
              <TopSlot isSpinning={isTopSlotSpinning} result={topSlotResult} customTextures={customTextures} />
            </div>
            
            {/* Wheel and Stand Container */}
            <div className="relative flex flex-col items-center">
                <Wheel segments={SEGMENTS_CONFIG} rotation={rotation} customTextures={customTextures} />
                 {/* Stand */}
                 <div className="relative -mt-10 w-80 h-24 z-[-1]">
                    {/* Stand Post */}
                    <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 h-[50px] w-20"
                    style={{
                        background: 'linear-gradient(to right, hsl(var(--secondary) / 0.8), hsl(var(--secondary)), hsl(var(--secondary) / 0.8))',
                        clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)',
                        filter: 'drop-shadow(0px -3px 8px rgba(0,0,0,0.4))'
                    }}
                    >
                    <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10"></div>
                    </div>
                    {/* Stand Base */}
                    <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-8 w-[200px] rounded-[100%_/_50%]"
                    style={{
                        background: 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary)/0.9))',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8), inset 0 3px 5px hsl(var(--accent)/0.2)',
                        borderTop: '4px solid hsl(var(--accent)/0.5)',
                    }}
                    />
                </div>
            </div>
            
            <div className="h-20 flex items-center justify-center">
                <Card className="bg-card/50 backdrop-blur-sm border-accent/30 p-2 shadow-lg">
                    <CardContent className="p-0 flex items-center gap-3">
                        <p className="text-sm font-bold pr-3 border-r border-muted-foreground/50 self-stretch flex items-center text-muted-foreground">
                            History
                        </p>
                        <div className="flex gap-1.5">
                            {spinHistory.map((segment) => (
                                <div
                                    key={segment.id}
                                    className="w-10 h-10 rounded-md flex items-center justify-center text-xs font-bold shadow-inner transition-all animate-in fade-in"
                                    style={{
                                        backgroundColor: segment.color,
                                        color: segment.textColor,
                                        textShadow: '1px 1px 1px rgba(0,0,0,0.3)',
                                    }}
                                    title={segment.label.replace('_', ' ')}
                                >
                                    <span className="text-center leading-tight">
                                        {segment.label.replace('_', '\n')}
                                    </span>
                                </div>
                            ))}
                            {[...Array(Math.max(0, 7 - spinHistory.length))].map((_, i) => (
                                <div key={`placeholder-${i}`} className="w-10 h-10 rounded-md bg-background/30" />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="h-16 flex items-center justify-center text-center">
                {aiMessage && gameState === 'RESULT' && (
                    <Card className={cn("bg-card/50 backdrop-blur-sm border-accent/30 p-3 transition-all duration-500", gameState === 'SPINNING' ? "opacity-0" : "opacity-100")}>
                        <CardContent className="p-0 flex items-center gap-3">
                          <Sparkles className="text-accent w-5 h-5"/>
                          <p className={cn("text-base", aiMessageColor[aiMessage.encouragementLevel])}>
                            {aiMessage.message}
                          </p>
                        </CardContent>
                    </Card>
                )}
            </div>
          </main>

          <footer className="w-full max-w-4xl">
            <Card className="w-full p-4 bg-card/50 backdrop-blur-sm border-accent/30 shadow-lg">
              <CardContent className="p-0 flex flex-col gap-4">
                <div className="grid grid-cols-4 gap-2">
                  {BET_OPTIONS.map(option => {
                    const customTexture = customTextures[option.id];
                    const style: React.CSSProperties = {
                      color: customTexture ? 'transparent' : option.textColor,
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
                        "h-auto flex-col p-2 gap-1 relative shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
                        "border-b-4 border-black/30 hover:border-b-2 active:border-b-0"
                      )}
                      onClick={() => handleBet(option.id)}
                      disabled={gameState !== 'BETTING' || isPaused}
                    >
                      <span className={cn(
                        "font-bold drop-shadow-md",
                        option.type === 'number' ? 'text-2xl' : 'text-sm tracking-wide uppercase leading-tight text-center'
                      )}>
                        {option.label}
                      </span>
                      <span className="text-sm font-mono font-semibold text-white/90 drop-shadow-sm">
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
                          <Button variant="outline" size="sm" onClick={() => bgFileInputRef.current?.click()}>
                            <Upload className="mr-2 h-3 w-3" />
                            Upload BG
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                               <Button variant="outline" size="sm">
                                <UploadCloud className="mr-2 h-3 w-3" />
                                Upload Texture
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuLabel>Bet/Bonus Options</DropdownMenuLabel>
                              {BET_OPTIONS.map(option => (
                                <DropdownMenuItem
                                  key={`upload-${option.id}`}
                                  onSelect={() => {
                                    setTextureUploadTarget(option.id);
                                    textureFileInputRef.current?.click();
                                  }}
                                >
                                  {option.label}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Top Slot Multipliers</DropdownMenuLabel>
                              {[...new Set(TOP_SLOT_RIGHT_REEL_ITEMS)].map(item => (
                                <DropdownMenuItem
                                  key={`upload-mult-${item}`}
                                  onSelect={() => {
                                    setTextureUploadTarget(String(item));
                                    textureFileInputRef.current?.click();
                                  }}
                                >
                                  {item}x
                                </DropdownMenuItem>
                              ))}
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
                
              </CardContent>
            </Card>
          </footer>
        </>
      )}
    </div>
  );
}
