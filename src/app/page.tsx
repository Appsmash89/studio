'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Volume2, VolumeX, Sparkles } from 'lucide-react';
import * as Tone from 'tone';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast"

const SEGMENTS = [
  { multiplier: 2, label: '2x', color: 'hsl(var(--primary))' },
  { multiplier: 0.5, label: '0.5x', color: 'hsl(var(--secondary))' },
  { multiplier: 3, label: '3x', color: 'hsl(var(--primary))' },
  { multiplier: 0, label: 'Lose', color: 'hsl(var(--secondary))' },
  { multiplier: 1.5, label: '1.5x', color: 'hsl(var(--primary))' },
  { multiplier: 0.5, label: '0.5x', color: 'hsl(var(--secondary))' },
  { multiplier: 5, label: '5x', color: 'hsl(var(--primary))' },
  { multiplier: 0, label: 'Lose', color: 'hsl(var(--secondary))' },
];
const SPIN_DURATION_SECONDS = 6;
const NUM_SEGMENTS = SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

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
    return polarToCartesian(center, center, radius * 0.65, angle);
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
                <path d={getSegmentPath(index)} fill={segment.color} stroke="hsl(var(--accent))" strokeWidth="2" />
                <text
                  x={getLabelPosition(index).x}
                  y={getLabelPosition(index).y}
                  fill="hsl(var(--primary-foreground))"
                  textAnchor="middle"
                  dy=".3em"
                  className="text-2xl font-bold font-headline"
                  transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE }, ${getLabelPosition(index).x}, ${getLabelPosition(index).y})`}
                >
                  {segment.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-accent border-4 border-background flex items-center justify-center shadow-lg">
       </div>
       <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2"
        style={{
          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
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
  const [bet, setBet] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [aiMessage, setAiMessage] = useState<AiEncouragementOutput | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  const sounds = useRef<{
    spin?: Tone.NoiseSynth;
    win?: Tone.Synth;
    lose?: Tone.Synth;
    initialized: boolean;
  }>({ initialized: false });
  
  useEffect(() => {
    if (typeof window !== 'undefined' && !sounds.current.initialized) {
        sounds.current.spin = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.2 },
            volume: -20,
        }).toDestination();
        sounds.current.win = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
            volume: -10,
        }).toDestination();
        sounds.current.lose = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.5, sustain: 0, release: 0.5 },
            volume: -10,
        }).toDestination();
        sounds.current.initialized = true;
    }

    return () => {
        sounds.current.spin?.dispose();
        sounds.current.win?.dispose();
        sounds.current.lose?.dispose();
    };
  }, []);

  const playSound = useCallback((sound: 'spin' | 'win' | 'lose') => {
    if (isMuted || !sounds.current.initialized) return;
    const now = Tone.now();
    if (sound === 'spin' && sounds.current.spin) {
      sounds.current.spin.triggerAttackRelease("8n", now);
    } else if (sound === 'win' && sounds.current.win) {
      sounds.current.win.triggerAttackRelease('C5', '8n', now);
      sounds.current.win.triggerAttackRelease('G5', '8n', now + 0.2);
    } else if (sound === 'lose' && sounds.current.lose) {
      sounds.current.lose.triggerAttackRelease('C3', '4n', now);
    }
  }, [isMuted]);

  const handleSpin = async () => {
    if (isSpinning) return;
    if (bet > balance) {
      toast({
        variant: "destructive",
        title: "Insufficient Balance",
        description: "Your balance is too low to place this bet.",
      });
      return;
    }
    
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    setIsSpinning(true);
    setBalance(prev => prev - bet);
    setAiMessage(null);
    playSound('spin');

    const winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    const winningSegment = SEGMENTS[winningSegmentIndex];
    
    const fullRotations = 5;
    const targetRotation = (fullRotations * 360) - (winningSegmentIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2);
    
    const randomOffset = (Math.random() - 0.5) * (SEGMENT_ANGLE * 0.8);
    const finalRotation = targetRotation + randomOffset;
    
    setRotation(prev => prev + finalRotation);
    
    setTimeout(async () => {
      const winAmount = bet * winningSegment.multiplier;
      setBalance(prev => prev + winAmount);
      
      const gameEvent = winAmount > bet ? 'win' : (winAmount < bet ? 'loss' : 'spin');
      if (winAmount > 0 && winningSegment.multiplier > 0) {
        playSound('win');
      } else {
        playSound('lose');
      }

      try {
        const encouragement = await getEncouragement({
          gameEvent,
          betAmount: bet,
          winAmount: winAmount,
        });
        setAiMessage(encouragement);
      } catch (error) {
        console.error("AI encouragement error:", error);
        setAiMessage({ message: "Good luck on the next spin!", encouragementLevel: 'low' });
      }

      setIsSpinning(false);
    }, SPIN_DURATION_SECONDS * 1000);
  };
  
  useEffect(() => {
    Tone.Destination.mute = isMuted;
  }, [isMuted]);

  const aiMessageColor = {
    low: 'text-muted-foreground',
    medium: 'text-foreground',
    high: 'text-accent',
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 overflow-hidden">
      <header className="absolute top-4 right-4 flex items-center gap-4">
          <Button onClick={() => setIsMuted(!isMuted)} variant="ghost" size="icon">
              {isMuted ? <VolumeX /> : <Volume2 />}
              <span className="sr-only">Toggle Sound</span>
          </Button>
      </header>

      <main className="flex flex-col items-center justify-center gap-8 w-full max-w-4xl">
        <h1 className="text-6xl font-headline text-accent tracking-wider" style={{ textShadow: '2px 2px 4px hsl(var(--primary))' }}>
          SpinRiches
        </h1>

        <Wheel segments={SEGMENTS} rotation={rotation} />
        
        <div className="h-20 flex items-center justify-center text-center">
            {aiMessage && (
                <Card className={cn("bg-card/50 backdrop-blur-sm border-accent/30 p-4 transition-all duration-500", isSpinning ? "opacity-0" : "opacity-100")}>
                    <CardContent className="p-0 flex items-center gap-3">
                      <Sparkles className="text-accent w-6 h-6"/>
                      <p className={cn("text-lg", aiMessageColor[aiMessage.encouragementLevel])}>
                        {aiMessage.message}
                      </p>
                    </CardContent>
                </Card>
            )}
        </div>

        <Card className="w-full max-w-md p-6 bg-card/50 backdrop-blur-sm border-accent/30 shadow-lg">
          <CardContent className="p-0 flex flex-col gap-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <div className="flex items-center gap-2">
                <Wallet className="text-accent" />
                <span>Balance</span>
              </div>
              <span>${balance.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <Input 
                type="number"
                value={bet}
                onChange={(e) => setBet(Math.max(1, parseInt(e.target.value) || 0))}
                className="text-lg text-center font-bold"
                disabled={isSpinning}
                aria-label="Bet amount"
              />
              <Button onClick={handleSpin} disabled={isSpinning} size="lg" className="flex-1 text-xl font-bold font-headline bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-accent/30 active:scale-95">
                {isSpinning ? 'Spinning...' : 'SPIN'}
              </a >
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
