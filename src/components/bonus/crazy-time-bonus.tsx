
'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Sparkles, Play } from 'lucide-react';

interface BonusGameProps {
    betAmount: number;
    onComplete: (winnings: number, details?: any) => void;
}

type Flapper = 'green' | 'blue' | 'yellow';
type Segment = { value: number | 'DOUBLE' | 'TRIPLE', color: string };

const TOP_SLOT_LEFT_REEL_ITEMS = ['1', '2', '5', '10', 'Coin Flip', 'Pachinko', 'Cash Hunt', 'Crazy Time'];
const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];
const REEL_ITEM_HEIGHT = 80; // h-20 in tailwind

const Reel = ({ items, result, isSpinning }: { items: (string | number)[], result: string | number | null, isSpinning: boolean }) => {
    const duplicatedItems = useMemo(() => [...items, ...items, ...items, ...items], [items]);
    const reelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isSpinning && result !== null && reelRef.current) {
            const resultIndex = items.indexOf(result);
            // Position to land on the second set of items for a smoother "slow down" effect
            const targetIndex = items.length + resultIndex;
            const targetOffset = targetIndex * REEL_ITEM_HEIGHT;
            reelRef.current.style.transform = `translateY(-${targetOffset}px)`;
        }
    }, [isSpinning, result, items]);

    return (
        <div className="w-1/2 h-full overflow-hidden">
            <div
                ref={reelRef}
                className={cn(
                    "flex flex-col",
                    isSpinning ? 'animate-top-slot-spin' : 'transition-transform duration-[3s] ease-out'
                )}
            >
                {duplicatedItems.map((item, i) => (
                    <div key={i} className="h-20 flex-shrink-0 flex items-center justify-center text-xl font-bold text-white uppercase text-center leading-tight tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}>
                        {typeof item === 'string' ? item.replace(' ', '\n') : `${item}x`}
                    </div>
                ))}
            </div>
        </div>
    );
};


const TopSlot = () => {
    const [isSpinning, setIsSpinning] = useState(true);
    const [result, setResult] = useState<{ left: string | null; right: number | null }>({ left: null, right: null });

    useEffect(() => {
        const leftResult = TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)];
        const rightResult = TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)];
        
        setTimeout(() => {
            setResult({ left: leftResult, right: rightResult });
            setIsSpinning(false);
        }, 4000); // Spin for 4 seconds
    }, []);

    return (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-80 h-24 bg-gradient-to-br from-purple-900 via-slate-800 to-purple-900 rounded-xl border-4 border-yellow-400 shadow-2xl flex items-center justify-center p-1 gap-1">
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg" style={{ clipPath: 'polygon(100% 0, 0 50%, 100% 100%)' }} />
            <div className="w-full h-full flex gap-1 bg-black/50 rounded-md relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-yellow-400/50" />
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-20 border-y-2 border-yellow-500/70 bg-white/5 pointer-events-none" />
                
                <Reel items={TOP_SLOT_LEFT_REEL_ITEMS} result={result.left} isSpinning={isSpinning} />
                <Reel items={TOP_SLOT_RIGHT_REEL_ITEMS} result={result.right} isSpinning={isSpinning} />
            </div>
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-4 h-8 bg-yellow-400/80 shadow-lg" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        </div>
    );
};


const INITIAL_WHEEL_SEGMENTS: Segment[] = [
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' },
    { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' },
    { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' },
    { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' },
    { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' },
    { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' },
    { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' },
    { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' },
];


const NUM_SEGMENTS = INITIAL_WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
const SPIN_DURATION_SECONDS = 17;
const MAX_MULTIPLIER = 20000;

const FLAPPERS: { id: Flapper, color: string, position: number }[] = [
    { id: 'green', color: 'hsl(140, 70%, 50%)', position: -15 }, // angle offset from top center
    { id: 'blue', color: 'hsl(210, 80%, 60%)', position: 15 },
    { id: 'yellow', color: 'hsl(45, 90%, 55%)', position: 0 },
];

const BonusWheel = ({ segments, rotation }: { segments: Segment[]; rotation: number }) => {
    const radius = 300;
    const center = 310;

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
        return polarToCartesian(center, center, radius * 0.8, angle);
    };

    return (
        <div className="relative w-[620px] h-[620px] flex items-center justify-center scale-[0.6] sm:scale-75 md:scale-90 lg:scale-100">
             <div
                className="absolute w-full h-full rounded-full"
                style={{
                    transition: `transform ${SPIN_DURATION_SECONDS}s cubic-bezier(0.65, 0, 0.35, 1)`,
                    transform: `rotate(${rotation}deg)`,
                }}
            >
                <svg viewBox="0 0 620 620">
                     <defs>
                        <filter id="crazy-shadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="5" stdDeviation="10" floodColor="rgba(0,0,0,0.6)" />
                        </filter>
                    </defs>
                    <g filter="url(#crazy-shadow)">
                        {segments.map((segment, index) => (
                            <g key={index}>
                                <path
                                    d={getSegmentPath(index)}
                                    fill={segment.color}
                                    stroke="hsl(43, 78%, 58%)"
                                    strokeWidth="3"
                                />
                                <text
                                    x={getLabelPosition(index).x}
                                    y={getLabelPosition(index).y}
                                    fill="white"
                                    textAnchor="middle"
                                    dy=".3em"
                                    className="text-xl font-bold uppercase"
                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
                                    transform={`rotate(${ (index + 0.5) * SEGMENT_ANGLE + 90 }, ${getLabelPosition(index).x}, ${getLabelPosition(index).y})`}
                                >
                                    {typeof segment.value === 'number' ? `${segment.value}x` : segment.value}
                                </text>
                            </g>
                        ))}
                    </g>
                </svg>
            </div>
             {/* Center piece */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-8 border-yellow-300 flex items-center justify-center shadow-lg"
                style={{ background: 'radial-gradient(circle, hsl(43, 98%, 68%) 60%, hsl(43, 88%, 48%))' }}
            >
                <Sparkles className="w-10 h-10 text-white"/>
            </div>
             {/* Flappers */}
            {FLAPPERS.map(flapper => (
                <div
                    key={flapper.id}
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[1px]"
                    style={{
                        transformOrigin: 'bottom center',
                        transform: `rotate(${flapper.position}deg)`,
                        transition: 'transform 0.5s ease-in-out',
                    }}
                >
                    <div
                        className="w-1 h-12"
                        style={{ background: flapper.color }}
                    />
                    <div
                        className="w-8 h-8 rounded-full -mt-1 -ml-3.5"
                        style={{
                            background: flapper.color,
                            border: '3px solid white',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            ))}
        </div>
    );
}


export function CrazyTimeBonus({ betAmount, onComplete }: BonusGameProps) {
    const [gameState, setGameState] = useState<'picking' | 'ready_to_spin' | 'spinning' | 'result'>('picking');
    const [selectedFlapper, setSelectedFlapper] = useState<Flapper | null>(null);
    const [segments, setSegments] = useState<Segment[]>(INITIAL_WHEEL_SEGMENTS);
    const [rotation, setRotation] = useState(0);
    const [spinHistory, setSpinHistory] = useState<(string | number)[]>([]);
    const [winnings, setWinnings] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    const handleSelectFlapper = (flapperId: Flapper) => {
        if (gameState !== 'picking') return;
        setSelectedFlapper(flapperId);
        setGameState('ready_to_spin');
    };

    const handleSpin = async () => {
        if (!selectedFlapper || gameState !== 'ready_to_spin') return;
        setGameState('spinning');
    
        let currentSegments = [...segments];
        let finalWinnings = 0;
        let finalMultiplier = 0;
        let tempHistory: (string | number)[] = [];
        let spinCount = 0;
    
        while (true) {
            spinCount++;
            const winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
            const flapperData = FLAPPERS.find(f => f.id === selectedFlapper);
            if (!flapperData) return; // Should not happen
            
            const flapperAngleOffset = flapperData.position;
            const finalRotation = 360 * (6 + spinCount) - (winningSegmentIndex * SEGMENT_ANGLE) - (SEGMENT_ANGLE / 2) + flapperAngleOffset;

            setRotation(finalRotation);
            
            await new Promise(res => setTimeout(res, SPIN_DURATION_SECONDS * 1000 + 500));
            
            const winningSegment = currentSegments[winningSegmentIndex];
            tempHistory.push(winningSegment.value);
            setSpinHistory([...tempHistory]);
    
            if (winningSegment.value === 'DOUBLE' || winningSegment.value === 'TRIPLE') {
                const multiplier = winningSegment.value === 'DOUBLE' ? 2 : 3;
                currentSegments = currentSegments.map(seg => ({
                    ...seg,
                    value: typeof seg.value === 'number' ? Math.min(seg.value * multiplier, MAX_MULTIPLIER) : seg.value,
                }));
                setSegments([...currentSegments]);
                await new Promise(res => setTimeout(res, 2000)); // Pause to show new values
            } else {
                finalMultiplier = winningSegment.value as number;
                finalWinnings = betAmount * finalMultiplier;
                break;
            }
        }
    
        setWinnings(finalWinnings);
        setGameState('result');
    };

    const handleComplete = () => {
        if (isCompleted) return;
        setIsCompleted(true);
        onComplete(winnings, {
            crazyTimeDetails: {
                selectedFlapper,
                spinHistory,
                finalSegments: segments.map(s => s.value),
            }
        });
    };

    const getMessage = () => {
        switch (gameState) {
            case 'picking':
                return 'Pick Your Flapper!';
            case 'ready_to_spin':
                return 'Press Spin when you\'re ready!';
            case 'spinning':
                const lastSpin = spinHistory[spinHistory.length - 1];
                if (lastSpin === 'DOUBLE' || lastSpin === 'TRIPLE') {
                    return `${lastSpin}! Re-spinning!`;
                }
                return 'Wheel is spinning...';
            case 'result':
                const finalMultiplier = spinHistory[spinHistory.length - 1];
                return `Your flapper landed on ${finalMultiplier}x!`;
            default:
                return '';
        }
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-in fade-in p-4 overflow-hidden">
            <Card className="w-full h-full max-w-7xl max-h-[95vh] flex flex-col bg-transparent border-none text-white shadow-none">
                <CardHeader className="text-center">
                    <CardTitle className="text-4xl md:text-5xl font-headline text-accent" style={{ textShadow: '2px 2px 8px hsl(var(--primary))' }}>
                        CRAZY TIME
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center gap-4 relative -mt-8">
                    
                    {(gameState === 'spinning' || gameState === 'result') && <TopSlot />}

                    <div className="absolute top-4 left-4 right-4 text-center z-10">
                        <p className="text-2xl font-bold animate-pulse">{getMessage()}</p>
                        {spinHistory.length > 0 && (
                            <p className="text-sm text-muted-foreground">History: {spinHistory.join(' -> ')}</p>
                        )}
                    </div>
                    
                    <BonusWheel segments={segments} rotation={rotation} />
                    
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col items-center gap-4">
                        {gameState === 'picking' && (
                            <div className="flex gap-4">
                                {FLAPPERS.map(flapper => (
                                    <Button
                                        key={flapper.id}
                                        onClick={() => handleSelectFlapper(flapper.id)}
                                        style={{ backgroundColor: flapper.color, color: 'white', border: `3px solid ${flapper.color}` }}
                                        className="w-32 h-16 text-xl font-bold uppercase transition-transform hover:scale-105"
                                    >
                                        {flapper.id}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {gameState === 'ready_to_spin' && (
                            <Button onClick={handleSpin} className="w-48 h-20 bg-red-600 hover:bg-red-700 text-white text-3xl font-bold rounded-full animate-pulse">
                                <Play className="w-10 h-10 mr-2" />
                                SPIN
                            </Button>
                        )}

                        {gameState === 'result' && (
                             <div className="text-center animate-in fade-in zoom-in-50 bg-black/50 p-4 rounded-lg">
                                <p className="text-4xl font-bold text-accent my-1">You Won ${winnings.toLocaleString()}!</p>
                                <Button onClick={handleComplete} disabled={isCompleted} className="mt-4">Continue</Button>
                            </div>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}
