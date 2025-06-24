
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Sparkles, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { CoinFlipBonus } from '@/components/bonus/coin-flip-bonus';
import { PachinkoBonus } from '@/components/bonus/pachinko-bonus';
import { CashHuntBonus } from '@/components/bonus/cash-hunt-bonus';
import { CrazyTimeBonus } from '@/components/bonus/crazy-time-bonus';


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

const textColorMap = BET_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.textColor;
  return acc;
}, {} as Record<string, string>);

const SEGMENTS_CONFIG = [
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'PACHINKO', type: 'bonus', multiplier: 0, color: 'hsl(320, 70%, 60%)' },
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'CASH_HUNT', type: 'bonus', multiplier: 0, color: 'hsl(100, 60%, 60%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'PACHINKO', type: 'bonus', multiplier: 0, color: 'hsl(320, 70%, 60%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'CRAZY_TIME', type: 'bonus', multiplier: 0, color: 'hsl(0, 80%, 60%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'CASH_HUNT', type: 'bonus', multiplier: 0, color: 'hsl(100, 60%, 60%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '10', type: 'number', multiplier: 10, color: 'hsl(280, 80%, 65%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
    { label: '1', type: 'number', multiplier: 1, color: 'hsl(220, 15%, 85%)' },
    { label: 'COIN_FLIP', type: 'bonus', multiplier: 0, color: 'hsl(45, 90%, 60%)' },
    { label: '2', type: 'number', multiplier: 2, color: 'hsl(210, 80%, 55%)' },
    { label: '5', type: 'number', multiplier: 5, color: 'hsl(140, 60%, 50%)' },
].map(seg => ({ ...seg, textColor: textColorMap[seg.label]! }));


const NUM_SEGMENTS = SEGMENTS_CONFIG.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
const SPIN_DURATION_SECONDS = 8;
const BETTING_TIME_SECONDS = 15;
const RESULT_DISPLAY_SECONDS = 5;

const CHIP_VALUES = [1, 5, 10, 25, 100];
const initialBetsState = BET_OPTIONS.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});

const adjustHsl = (hsl: string, h: number, l: number) => {
  const [hue, saturation, lightness] = hsl.match(/\d+/g)!.map(Number);
  return `hsl(${hue + h}, ${saturation}%, ${lightness + l}%)`;
}

const Wheel = ({ segments, rotation }: { segments: typeof SEGMENTS_CONFIG; rotation: number }) => {
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
          </defs>
          <g filter="url(#shadow)">
            {segments.map((segment, index) => (
              <g key={index}>
                <path 
                  d={getSegmentPath(index)} 
                  fill={segment.color} 
                  stroke="hsl(43, 78%, 58%)" 
                  strokeWidth="2" 
                  filter={segment.type === 'bonus' ? 'url(#glow)' : undefined}
                />
                <text
                  x={getLabelPosition(index).x}
                  y={getLabelPosition(index).y}
                  fill={segment.textColor}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-lg font-bold uppercase tracking-wider"
                  style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.4))' }}
                  transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${getLabelPosition(index).x}, ${getLabelPosition(index).y})`}
                >
                  {segment.label.replace('_', '\n')}
                </text>
              </g>
            ))}
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
  const [selectedChip, setSelectedChip] = useState(10);
  const [rotation, setRotation] = useState(0);
  const [aiMessage, setAiMessage] = useState<AiEncouragementOutput | null>(null);
  const { toast } = useToast();
  const [forcedWinner, setForcedWinner] = useState<string | null>(null);

  const [gameState, setGameState] = useState<'BETTING' | 'SPINNING' | 'RESULT' | 'BONUS_COIN_FLIP' | 'BONUS_PACHINKO' | 'BONUS_CASH_HUNT' | 'BONUS_CRAZY_TIME'>('BETTING');
  const [countdown, setCountdown] = useState(BETTING_TIME_SECONDS);
  const [winningSegment, setWinningSegment] = useState<(typeof SEGMENTS_CONFIG)[0] & { id: number } | null>(null);
  const [spinHistory, setSpinHistory] = useState<((typeof SEGMENTS_CONFIG)[0] & { id: number })[]>([]);
  const spinIdCounter = useRef(0);

  const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const handleBet = (optionId: string) => {
    if (gameState !== 'BETTING') return;
    if (balance < selectedChip) {
      toast({ variant: "destructive", title: "Not enough balance to place that bet." });
      return;
    }
    setBalance(prev => prev - selectedChip);
    setBets(prev => ({...prev, [optionId]: prev[optionId] + selectedChip}));
  }

  const handleClearBets = () => {
    if (gameState !== 'BETTING') return;
    setBalance(prev => prev + totalBet);
    setBets(initialBetsState);
  }

  const handleBonusComplete = useCallback(async (bonusWinnings: number) => {
    const winningLabel = winningSegment!.label;
    const betOnWinner = bets[winningLabel] || 0;
    const totalWinnings = betOnWinner + bonusWinnings;

    setBalance(prev => prev + totalWinnings);

    try {
        const encouragement = await getEncouragement({
            gameEvent: 'win',
            betAmount: totalBet,
            winAmount: totalWinnings,
        });
        setAiMessage(encouragement);
    } catch (error) {
        console.error("AI encouragement error:", error);
        setAiMessage({ message: "What a bonus round!", encouragementLevel: 'high' });
    }
    setGameState('RESULT');
  }, [bets, totalBet, winningSegment]);

  const handleSpin = useCallback(async () => {
    if (gameState !== 'BETTING') return;
    setGameState('SPINNING');
    setAiMessage(null);

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
      const winningLabel = winningSegmentWithId.label;
      const betOnWinner = bets[winningLabel] || 0;

      if (winningSegmentWithId.type === 'bonus') {
          if (betOnWinner > 0) {
              setWinningSegment(winningSegmentWithId);
              setSpinHistory(prev => [winningSegmentWithId, ...prev].slice(0, 7));
              setGameState(`BONUS_${winningLabel}` as any);
          } else {
              try {
                  const encouragement = await getEncouragement({
                      gameEvent: 'loss',
                      betAmount: totalBet,
                      winAmount: 0,
                  });
                  setAiMessage(encouragement);
              } catch (error) {
                  console.error("AI encouragement error:", error);
                  setAiMessage({ message: "Good luck next time!", encouragementLevel: 'low' });
              }
              setWinningSegment(winningSegmentWithId);
              setSpinHistory(prev => [winningSegmentWithId, ...prev].slice(0, 7));
              setGameState('RESULT');
          }
          return;
      }
      
      let totalWinnings = 0;
      if (betOnWinner > 0) {
        totalWinnings = betOnWinner * winningSegmentWithId.multiplier + betOnWinner;
      }
      
      setBalance(prev => prev + totalWinnings);

      if (totalBet > 0) {
        try {
          const encouragement = await getEncouragement({
            gameEvent: totalWinnings > totalBet ? 'win' : 'loss',
            betAmount: totalBet,
            winAmount: totalWinnings,
          });
          setAiMessage(encouragement);
        } catch (error) {
          console.error("AI encouragement error:", error);
          setAiMessage({ message: "Good luck on the next spin!", encouragementLevel: 'low' });
        }
      }
      
      setWinningSegment(winningSegmentWithId);
      setSpinHistory(prev => [winningSegmentWithId, ...prev].slice(0, 7));
      setGameState('RESULT');

    }, SPIN_DURATION_SECONDS * 1000);
  }, [bets, totalBet, forcedWinner, gameState]);

  // Game Loop Timer
  useEffect(() => {
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
        setAiMessage(null);
        setWinningSegment(null);
      }, RESULT_DISPLAY_SECONDS * 1000);
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown, handleSpin]);
  

  const aiMessageColor = {
    low: 'text-muted-foreground',
    medium: 'text-foreground',
    high: 'text-accent',
  };
  
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-background text-foreground p-4 overflow-hidden">
      {gameState === 'BONUS_COIN_FLIP' && <CoinFlipBonus betAmount={bets['COIN_FLIP']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_PACHINKO' && <PachinkoBonus betAmount={bets['PACHINKO']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CASH_HUNT' && <CashHuntBonus betAmount={bets['CASH_HUNT']} onComplete={handleBonusComplete} />}
      {gameState === 'BONUS_CRAZY_TIME' && <CrazyTimeBonus betAmount={bets['CRAZY_TIME']} onComplete={handleBonusComplete} />}

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
                        Place Your Bets
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
                        Winner is...
                    </h2>
                    <p className="text-4xl font-headline text-accent">{winningSegment.label.replace('_', ' ')}</p>
                </>
            )}
        </div>
        
        <Wheel segments={SEGMENTS_CONFIG} rotation={rotation} />
        
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
              {BET_OPTIONS.map(option => (
                <Button
                  key={option.id}
                  variant="secondary"
                  style={{
                    background: `linear-gradient(145deg, ${option.color}, ${adjustHsl(option.color, -10, -20)})`,
                    color: option.textColor,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                    fontFamily: "'Playfair Display', serif",
                  }}
                  className={cn(
                    "h-auto flex-col p-2 gap-1 relative shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200",
                    "border-b-4 border-black/30 hover:border-b-2 active:border-b-0"
                  )}
                  onClick={() => handleBet(option.id)}
                  disabled={gameState !== 'BETTING'}
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
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 p-1 rounded-md bg-background/50">
                {CHIP_VALUES.map(chip => (
                  <Button key={chip} size="sm" variant={selectedChip === chip ? 'default' : 'ghost'} className="rounded-full w-10 h-10 text-xs" onClick={() => setSelectedChip(chip)} disabled={gameState !== 'BETTING'}>
                    ${chip}
                  </Button>
                ))}
              </div>
              <div className="flex-grow flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleClearBets} disabled={gameState !== 'BETTING' || totalBet === 0}><XCircle className="w-5 h-5"/></Button>
                 <Card className="bg-card/80">
                    <CardContent className="p-2 text-center">
                        <p className="text-sm text-muted-foreground">Total Bet</p>
                        <p className="text-2xl font-bold text-accent">${totalBet.toLocaleString()}</p>
                    </CardContent>
                </Card>
              </div>
            </div>
            <div className="mt-2 p-2 border border-dashed border-muted-foreground/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground mb-2">
                Dev Tools: Force Next Spin Outcome
              </p>
              <div className="grid grid-cols-4 gap-2">
                {BET_OPTIONS.map(option => (
                  <Button
                    key={`force-${option.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => setForcedWinner(option.id)}
                    disabled={gameState !== 'BETTING'}
                    className={cn("h-auto p-1 text-[10px]", {"ring-2 ring-accent": forcedWinner === option.id})}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {forcedWinner && (
                <p className="text-xs text-center text-accent mt-2 animate-pulse">
                  Next spin will land on: {BET_OPTIONS.find(o => o.id === forcedWinner)?.label || forcedWinner}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
