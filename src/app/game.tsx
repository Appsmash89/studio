
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { getEncouragement, type AiEncouragementOutput } from '@/ai/flows/ai-encouragement';
import { buttonVariants } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/auth-context';

import { CoinFlipBonus } from '@/components/bonus/coin-flip-bonus';
import { PachinkoBonus } from '@/components/bonus/pachinko-bonus';
import { CashHuntBonus } from '@/components/bonus/cash-hunt-bonus';
import { CrazyTimeBonus } from '@/components/bonus/crazy-time-bonus';

import { GameHeader } from '@/components/game/game-header';
import { GameHistory } from '@/components/game/game-history';
import { BettingInterface } from '@/components/game/betting-interface';
import { GameStatusDisplay } from '@/components/game/game-status-display';
import { TopSlot, TOP_SLOT_RIGHT_REEL_ITEMS } from '@/components/top-slot';
import { Wheel } from '@/components/game/wheel';
import { DevTools } from '@/components/dev/dev-tools';

import { 
    BET_OPTIONS,
    BET_OPTION_INDEX_MAP,
    SEGMENTS_CONFIG,
    NUM_SEGMENTS,
    SPIN_DURATION_SECONDS,
    BETTING_TIME_SECONDS,
    RESULT_DISPLAY_SECONDS,
    TOP_SLOT_ANIMATION_DURATION_MS,
    TOP_SLOT_LEFT_REEL_ITEMS,
    CHIP_VALUES,
    initialBetsState,
    type GameLogEntry
} from '@/config/game-config';
import { cn } from '@/lib/utils';


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
    
    const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
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

    if (gameState === 'BETTING' && countdown > 0) {
        timer = setTimeout(() => {
          setCountdown(c => c - 1);
        }, 1000);
    } else if (gameState === 'BETTING' && countdown <= 0) {
        handleSpin();
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

  const isBonusActive = gameState.startsWith('BONUS_');
  const hasCustomAssets = Object.keys(customTextures).length > 0 || !backgroundImage.startsWith('https://placehold.co');
  
  return (
    <div className="relative flex flex-col min-h-screen text-foreground overflow-y-auto">
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
          const radius = 32;
          const circumference = 2 * Math.PI * radius;
          const progressPercentage = Math.max(0, countdown) / BETTING_TIME_SECONDS;
          const strokeDashoffset = circumference * (1 - progressPercentage);

          const getTimerColor = () => {
              if (countdown <= 4) return 'text-red-500';
              if (countdown <= 10) return 'text-yellow-500';
              return 'text-green-500';
          };

          return (
              <div className="fixed top-20 left-4 z-50">
                  <div className="relative h-20 w-20">
                      <svg className="w-full h-full" viewBox="0 0 70 70">
                          <circle
                              className="stroke-current text-foreground/20"
                              strokeWidth="5"
                              fill="transparent"
                              r={radius}
                              cx="35"
                              cy="35"
                          />
                          <circle
                              className={cn(
                                  "stroke-current",
                                  getTimerColor()
                              )}
                              strokeWidth="5"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                              r={radius}
                              cx="35"
                              cy="35"
                              transform="rotate(-90 35 35)"
                              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease-in-out' }}
                          />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-headline text-foreground">{Math.max(0, countdown)}</span>
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
        <div className="flex flex-col flex-grow">
          <GameHeader
            balance={balance}
            user={user}
            signOut={signOut}
          />
          
          <main className="flex-grow flex flex-col items-center justify-center gap-4 px-4 py-8">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="my-4 z-20">
                    <TopSlot isSpinning={isTopSlotSpinning} result={topSlotResult} customTextures={customTextures} hideText={hideText} />
                </div>
                
                <div className="relative flex flex-col items-center">
                    <Wheel segments={SEGMENTS_CONFIG} rotation={rotation} customTextures={customTextures} hideText={hideText} textureRotation={textureRotation} spinDuration={SPIN_DURATION_SECONDS} />
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

                <GameStatusDisplay
                  gameState={gameState}
                  isPaused={isPaused}
                  winningSegment={winningSegment}
                  aiMessage={aiMessage}
                />
            </div>
            
            <GameHistory spinHistory={spinHistory} customTextures={customTextures} />

            <BettingInterface
              bets={bets}
              handleBet={handleBet}
              gameState={gameState}
              isPaused={isPaused}
              selectedChip={selectedChip}
              setSelectedChip={setSelectedChip}
              handleUndoBet={handleUndoBet}
              handleClearBets={handleClearBets}
              totalBet={totalBet}
              customTextures={customTextures}
              hideText={hideText}
            />

          </main>

          <DevTools
            showLegend={showLegend}
            setShowLegend={setShowLegend}
            setIsTopSlotSpinning={setIsTopSlotSpinning}
            handleSkipCountdown={handleSkipCountdown}
            gameState={gameState}
            isPaused={isPaused}
            handleCloseRound={handleCloseRound}
            setIsPaused={setIsPaused}
            bgFileInputRef={bgFileInputRef}
            handleBgImageUpload={handleBgImageUpload}
            textureFileInputRef={textureFileInputRef}
            handleTextureUpload={handleTextureUpload}
            handleUploadClick={handleUploadClick}
            setIsClearTexturesAlertOpen={setIsClearTexturesAlertOpen}
            hasCustomAssets={hasCustomAssets}
            handleDownloadLatestSpinData={handleDownloadLatestSpinData}
            gameLog={gameLog}
            handleGenerateAndDownload={handleGenerateAndDownload}
            isGenerating={isGenerating}
            handleDownloadLog={handleDownloadLog}
            disableAi={disableAi}
            setDisableAi={setDisableAi}
            hideText={hideText}
            setHideText={setHideText}
            textureRotation={textureRotation}
            setTextureRotation={setTextureRotation}
            customTextures={customTextures}
            skipBetsInDataGen={skipBetsInDataGen}
            setSkipBetsInDataGen={setSkipBetsInDataGen}
            forcedWinner={forcedWinner}
            setForcedWinner={setForcedWinner}
            forcedTopSlotLeft={forcedTopSlotLeft}
            setForcedTopSlotLeft={setForcedTopSlotLeft}
            forcedTopSlotRight={forcedTopSlotRight}
            setForcedTopSlotRight={setForcedTopSlotRight}
          />
        </div>
      )}
    </div>
  );
}
