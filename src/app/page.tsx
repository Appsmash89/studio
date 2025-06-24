'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Volume2, VolumeX, Sparkles, XCircle } from 'lucide-react';
import * as Tone from 'tone';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"

const SEGMENTS = [
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
  ];
const NUM_SEGMENTS = SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
const SPIN_DURATION_SECONDS = 8;

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

const CHIP_VALUES = [1, 5, 10, 25, 100];
const initialBetsState = BET_OPTIONS.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});

// Helper to adjust HSL color values for gradients
const adjustHsl = (hsl: string, h: number, l: number) => {
  const [hue, saturation, lightness] = hsl.match(/\d+/g)!.map(Number);
  return `hsl(${hue + h}, ${saturation}%, ${lightness + l}%)`;
}

// Wheel Component
const Wheel = ({ segments, rotation }: { segments: typeof SEGMENTS; rotation: number }) => {
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
    return polarToCartesian(center, center, radius * 0.75, angle);
  };

  return (
    <div className="relative w-[420px] h-[420px] flex items-center justify-center">
      <div
        className="absolute w-full h-full rounded-full shadow-2xl"
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
          </defs>
          <g filter="url(#shadow)">
            {segments.map((segment, index) => (
              <g key={index}>
                <path d={getSegmentPath(index)} fill={segment.color} stroke="hsl(var(--accent))" strokeWidth="1" />
                <text
                  x={getLabelPosition(index).x}
                  y={getLabelPosition(index).y}
                  fill={segment.color.startsWith('hsl(220') ? 'hsl(var(--background))' : 'white'}
                  textAnchor="middle"
                  dy=".3em"
                  className="text-[10px] font-bold"
                  transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${getLabelPosition(index).x}, ${getLabelPosition(index).y})`}
                >
                  {segment.label.replace('_', '\n')}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-accent border-4 border-background flex items-center justify-center shadow-lg">
       </div>
       <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 transform"
        style={{
          clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
          width: '30px',
          height: '40px',
          backgroundColor: 'hsl(var(--accent))',
        }}
      />
    </div>
  );
};


export default function Home() {
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<{[key: string]: number}>(initialBetsState);
  const [selectedChip, setSelectedChip] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [aiMessage, setAiMessage] = useState<AiEncouragementOutput | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();
  const [forcedWinner, setForcedWinner] = useState<string | null>(null);

  const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const sounds = useRef<{
    spin?: Tone.NoiseSynth;
    win?: Tone.Synth;
    lose?: Tone.Synth;
    chip?: Tone.Synth;
    initialized: boolean;
  }>({ initialized: false });
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !sounds.current.initialized) {
        sounds.current.spin = new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.2 }, volume: -20 }).toDestination();
        sounds.current.win = new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }, volume: -10 }).toDestination();
        sounds.current.lose = new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 }, volume: -10 }).toDestination();
        sounds.current.chip = new Tone.MembraneSynth({ octaves: 4, pitchDecay: 0.1, volume: -15 }).toDestination();
        sounds.current.initialized = true;
    }

    return () => {
        sounds.current.spin?.dispose();
        sounds.current.win?.dispose();
        sounds.current.lose?.dispose();
        sounds.current.chip?.dispose();
    };
  }, []);

  const playSound = useCallback((sound: 'spin' | 'win' | 'lose' | 'chip') => {
    if (isMuted || !sounds.current.initialized) return;
    const now = Tone.now();
    if (sound === 'spin' && sounds.current.spin) {
      sounds.current.spin.triggerAttackRelease("2n", now);
    } else if (sound === 'win' && sounds.current.win) {
      sounds.current.win.triggerAttackRelease('C5', '8n', now);
      sounds.current.win.triggerAttackRelease('G5', '8n', now + 0.2);
    } else if (sound === 'lose' && sounds.current.lose) {
      sounds.current.lose.triggerAttackRelease('C3', '4n', now);
    } else if (sound === 'chip' && sounds.current.chip) {
      sounds.current.chip.triggerAttackRelease('C2', '8n', now);
    }
  }, [isMuted]);

  const handleBet = (optionId: string) => {
    if (isSpinning) return;
    if (balance < selectedChip) {
      toast({ variant: "destructive", title: "Not enough balance to place that bet." });
      return;
    }
    setBalance(prev => prev - selectedChip);
    playSound('chip');
    setBets(prev => ({...prev, [optionId]: prev[optionId] + selectedChip}));
  }

  const handleClearBets = () => {
    if (isSpinning) return;
    setBalance(prev => prev + totalBet);
    setBets(initialBetsState);
  }

  const handleSpin = async () => {
    if (isSpinning || totalBet === 0) return;
    
    if (Tone.context.state !== 'running') await Tone.start();
    
    setIsSpinning(true);
    setAiMessage(null);
    playSound('spin');

    let winningSegmentIndex;
    if (forcedWinner) {
      const possibleIndices = SEGMENTS.reduce((acc, segment, index) => {
        if (segment.label === forcedWinner) {
          acc.push(index);
        }
        return acc;
      }, [] as number[]);
      
      if (possibleIndices.length > 0) {
        winningSegmentIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
      } else {
        // Fallback to random if forcedWinner is invalid
        winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
      }
      setForcedWinner(null); // Reset for the next spin
    } else {
      winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    }
    
    const winningSegment = SEGMENTS[winningSegmentIndex];
    
    const fullRotations = 7;
    const targetRotation = (fullRotations * 360) - (winningSegmentIndex * SEGMENT_ANGLE);
    const randomOffset = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.9);
    setRotation(prev => prev + targetRotation + randomOffset);
    
    setTimeout(async () => {
      let totalWinnings = 0;
      const winningLabel = winningSegment.label;
      const betOnWinner = bets[winningLabel] || 0;

      if (betOnWinner > 0) {
        if (winningSegment.type === 'number') {
          totalWinnings = betOnWinner * winningSegment.multiplier + betOnWinner; // Payout + stake back
        } else { // Bonus game
          totalWinnings = betOnWinner; // Return stake, show toast
          toast({ title: "Bonus Round!", description: `You entered the ${winningLabel.replace('_', ' ')} bonus game!` });
        }
      }
      
      if (totalWinnings > 0) playSound('win'); else playSound('lose');
      setBalance(prev => prev + totalWinnings);

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
      
      setBets(initialBetsState);
      setIsSpinning(false);
    }, SPIN_DURATION_SECONDS * 1000);
  };
  
  useEffect(() => { Tone.Destination.mute = isMuted; }, [isMuted]);

  const aiMessageColor = {
    low: 'text-muted-foreground',
    medium: 'text-foreground',
    high: 'text-accent',
  };
  
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <header className="w-full flex justify-between items-center absolute top-4 px-4">
        <div className="flex items-center gap-4">
          <Card className="p-2 px-4 bg-card/50 backdrop-blur-sm border-accent/30">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Wallet className="text-accent" />
              <span>${balance.toLocaleString()}</span>
            </div>
          </Card>
        </div>
        <Button onClick={() => setIsMuted(!isMuted)} variant="ghost" size="icon">
            {isMuted ? <VolumeX /> : <Volume2 />}
            <span className="sr-only">Toggle Sound</span>
        </Button>
      </header>

      <main className="flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-6xl font-headline text-accent tracking-wider" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
          SpinRiches
        </h1>

        <Wheel segments={SEGMENTS} rotation={rotation} />
        
        <div className="h-16 flex items-center justify-center text-center">
            {aiMessage && (
                <Card className={cn("bg-card/50 backdrop-blur-sm border-accent/30 p-3 transition-all duration-500", isSpinning ? "opacity-0" : "opacity-100")}>
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
                  disabled={isSpinning}
                >
                  <span className={cn(
                    "font-bold drop-shadow-md",
                    option.type === 'number' ? 'text-2xl' : 'text-[10px] tracking-wide uppercase leading-tight text-center'
                  )}>
                    {option.label.replace('_', ' ')}
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
                  <Button key={chip} size="sm" variant={selectedChip === chip ? 'default' : 'ghost'} className="rounded-full w-10 h-10 text-xs" onClick={() => setSelectedChip(chip)} disabled={isSpinning}>
                    ${chip}
                  </Button>
                ))}
              </div>
              <div className="flex-grow flex items-center justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={handleClearBets} disabled={isSpinning || totalBet === 0}><XCircle className="w-5 h-5"/></Button>
                 <Button onClick={handleSpin} disabled={isSpinning || totalBet === 0} size="lg" className="flex-1 max-w-xs text-xl font-bold font-headline bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-accent/30 active:scale-95">
                  {isSpinning ? 'Spinning...' : `SPIN ($${totalBet.toLocaleString()})`}
                </Button>
              </div>
            </div>
            <div className="mt-2 p-2 border border-dashed border-muted-foreground/50 rounded-lg">
              <p className="text-xs text-center text-muted-foreground mb-2">
                Dev Tools: Force Next Spin Outcome
              </p>
              <div className="grid grid-cols-4 gap-2">
                <Button size="sm" variant="outline" onClick={() => setForcedWinner('COIN_FLIP')} disabled={isSpinning}>Coin Flip</Button>
                <Button size="sm" variant="outline" onClick={() => setForcedWinner('PACHINKO')} disabled={isSpinning}>Pachinko</Button>
                <Button size="sm" variant="outline" onClick={() => setForcedWinner('CASH_HUNT')} disabled={isSpinning}>Cash Hunt</Button>
                <Button size="sm" variant="outline" onClick={() => setForcedWinner('CRAZY_TIME')} disabled={isSpinning}>Crazy Time</Button>
              </div>
              {forcedWinner && (
                <p className="text-xs text-center text-accent mt-2 animate-pulse">
                  Next spin will land on: {forcedWinner.replace('_', ' ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </footer>
    </div>
  );
}
