
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast"
import { useAuth } from '@/contexts/auth-context';

import { CoinFlipBonus } from '@/components/bonus/coin-flip-bonus';
import { PachinkoBonus } from '@/components/bonus/pachinko-bonus';
import { CashHuntBonus } from '@/components/bonus/cash-hunt-bonus';
import { CrazyTimeBonus } from '@/components/bonus/crazy-time-bonus';
import { NumberResultPopup } from '@/components/game/number-result-popup';

import { GameHeader } from '@/components/game/game-header';
import { GameHistory } from '@/components/game/game-history';
import { BettingInterface } from '@/components/game/betting-interface';
import { GameStatusDisplay } from '@/components/game/game-status-display';
import { TopSlot } from '@/components/top-slot';
import { Wheel } from '@/components/game/wheel';
import { DevTools } from '@/components/dev/dev-tools';
import { generateHourOfData } from '@/lib/data-generator';
import { assetManager } from '@/lib/asset-manager';
import { TransitionOverlay } from '@/components/game/transition-overlay';

import { 
    BET_OPTION_INDEX_MAP,
    SEGMENTS_CONFIG,
    NUM_SEGMENTS,
    BETTING_TIME_SECONDS,
    RESULT_DISPLAY_SECONDS,
    TOP_SLOT_ANIMATION_DURATION_MS,
    TOP_SLOT_LEFT_REEL_ITEMS,
    TOP_SLOT_RIGHT_REEL_ITEMS,
    initialBetsState,
    SPIN_DURATION_SECONDS,
    getChipValues,
} from '@/config/game-config';
import { cn } from '@/lib/utils';
import type { GameLogEntry, GameState, GameSegment, Bets, BetHistory, TopSlotResult } from '@/types/game';


export default function Game({ assetUrls }: { assetUrls: Record<string, string> }) {
  const { user, signOut } = useAuth();
  const [balance, setBalance] = useState(1000);
  const [bets, setBets] = useState<Bets>(initialBetsState);
  const [betHistory, setBetHistory] = useState<BetHistory>([]);
  const [chipValues, setChipValues] = useState<number[]>(() => getChipValues(balance));
  const [selectedChip, setSelectedChip] = useState<number>(() => getChipValues(balance)[3]);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();
  const [forcedWinner, setForcedWinner] = useState<string | null>(null);
  const [forcedTopSlotLeft, setForcedTopSlotLeft] = useState<string | null>(null);
  const [forcedTopSlotRight, setForcedTopSlotRight] = useState<number | null>(null);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  
  const [showLegend, setShowLegend] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skipBetsInDataGen, setSkipBetsInDataGen] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  
  const [hideText, setHideText] = useState(true);
  const [textureRotation, setTextureRotation] = useState(3.4);

  const [gameState, setGameState] = useState<GameState>('BETTING');
  const [countdown, setCountdown] = useState(BETTING_TIME_SECONDS);
  const [winningSegment, setWinningSegment] = useState<GameSegment | null>(null);
  const [roundWinnings, setRoundWinnings] = useState(0);
  const [spinHistory, setSpinHistory] = useState<GameSegment[]>([]);
  const spinIdCounter = useRef(0);
  
  const gameTimeouts = useRef<{
    spin: NodeJS.Timeout | null,
    topSlot: NodeJS.Timeout | null,
    countdown: NodeJS.Timeout | null,
    preBonus: NodeJS.Timeout | null,
    result: NodeJS.Timeout | null,
  }>({ spin: null, topSlot: null, countdown: null, preBonus: null, result: null });

  const [isTopSlotSpinning, setIsTopSlotSpinning] = useState(false);
  const [topSlotResult, setTopSlotResult] = useState<TopSlotResult | null>(null);
  const [activeMultiplier, setActiveMultiplier] = useState<{ optionId: string; multiplier: number } | null>(null);

  const totalBet = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  const spinDataRef = useRef({ bets, totalBet });
  spinDataRef.current = { bets, totalBet };

  const spinOutcomeRef = useRef<{
    winningSegment: GameSegment | null,
    topSlotResult: TopSlotResult | null,
    multiplierApplied: { optionId: string; multiplier: number } | null,
  }>({ winningSegment: null, topSlotResult: null, multiplierApplied: null });

  const clearGameTimeouts = useCallback(() => {
    Object.values(gameTimeouts.current).forEach(timeoutId => {
      if (timeoutId) clearTimeout(timeoutId);
    });
    gameTimeouts.current = { spin: null, topSlot: null, countdown: null, preBonus: null, result: null };
  }, []);

  useEffect(() => {
    const newChipValues = getChipValues(balance);
    setChipValues(newChipValues);

    const isChipValid = newChipValues.includes(selectedChip) && selectedChip <= balance;

    if (!isChipValid) {
      const bestChip = [...newChipValues].reverse().find(chip => chip <= balance);
      setSelectedChip(bestChip ?? (newChipValues[0] || 0));
    }
  }, [balance, selectedChip]);

  const startNewRound = useCallback(() => {
    clearGameTimeouts();
    setGameState('BETTING');
    setCountdown(BETTING_TIME_SECONDS);
    setBets(initialBetsState);
    setBetHistory([]);
    setWinningSegment(null);
    setRoundWinnings(0);
    setForcedWinner(null);
    setForcedTopSlotLeft(null);
    setForcedTopSlotRight(null);
    setActiveMultiplier(null);
    spinOutcomeRef.current = { winningSegment: null, topSlotResult: null, multiplierApplied: null };
  }, [clearGameTimeouts]);

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

  const handleSkipCountdown = () => {
    if (gameState !== 'BETTING') return;
    setCountdown(0);
  }

  const handleBonusComplete = useCallback(async (bonusWinnings: number, bonusDetails?: any) => {
    if (!winningSegment) return;
    const winningLabel = winningSegment.label;
    const betOnWinner = spinDataRef.current.bets[winningLabel] || 0;
    // The winnings returned from the bonus game already include the Top Slot multiplier.
    // We just need to add the original bet amount back.
    const roundWinnings = betOnWinner + bonusWinnings;

    setBalance(prev => prev + roundWinnings);
    
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
  }, [winningSegment]);

  const handleNumberResultComplete = useCallback(() => {
    setGameState('RESULT');
  }, []);

  const processSpinResult = useCallback(() => {
      const outcome = spinOutcomeRef.current;
      if (!outcome || !outcome.winningSegment || !outcome.topSlotResult) return;

      const { winningSegment: currentWinningSegment, topSlotResult: finalTopSlotResult, multiplierApplied } = outcome;
      const { bets: currentBets, totalBet: currentTotalBet } = spinDataRef.current;
      const winningLabel = currentWinningSegment.label;
      const betOnWinner = currentBets[winningLabel] || 0;

      const rightIndex = finalTopSlotResult.right !== null
          ? TOP_SLOT_RIGHT_REEL_ITEMS.findIndex(item => item === finalTopSlotResult.right)
          : null;

      setWinningSegment(currentWinningSegment);
      setSpinHistory(prev => [currentWinningSegment, ...prev].slice(0, 7));

      if (currentWinningSegment.type === 'bonus') {
          const isBonusWin = betOnWinner > 0;

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

          if (isBonusWin) {
              if (multiplierApplied) {
                  setGameState('PRE_BONUS');
              } else {
                  setGameState(`BONUS_${winningLabel}` as any);
              }
          } else {
              setGameState('RESULT');
          }
          return;
      }

      // It's a number win
      let calculatedWinnings = 0;
      if (betOnWinner > 0) {
          let effectiveMultiplier = currentWinningSegment.multiplier;
          if (multiplierApplied) {
              effectiveMultiplier = multiplierApplied.multiplier;
          }
          calculatedWinnings = betOnWinner * effectiveMultiplier + betOnWinner;
      }

      setRoundWinnings(calculatedWinnings);
      setBalance(prev => prev + calculatedWinnings);

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
          roundWinnings: calculatedWinnings,
          netResult: calculatedWinnings - currentTotalBet,
      };
      setGameLog(prev => [newLogEntry, ...prev]);

      setGameState('NUMBER_RESULT');
  }, []);

  const handleSpin = useCallback(async () => {
    setGameState('SPINNING');
    spinIdCounter.current++;

    // --- Top Slot Logic ---
    const finalTopSlotResult = {
        left: forcedTopSlotLeft ?? TOP_SLOT_LEFT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_LEFT_REEL_ITEMS.length)],
        right: forcedTopSlotRight ?? TOP_SLOT_RIGHT_REEL_ITEMS[Math.floor(Math.random() * TOP_SLOT_RIGHT_REEL_ITEMS.length)],
    };

    setTopSlotResult(finalTopSlotResult);
    setIsTopSlotSpinning(true);
    
    gameTimeouts.current.topSlot = setTimeout(() => {
        setIsTopSlotSpinning(false);
    }, TOP_SLOT_ANIMATION_DURATION_MS);


    // --- Main Wheel Logic ---
    let winningSegmentIndex;
    if (forcedWinner) {
      const possibleIndices = SEGMENTS_CONFIG.reduce((acc, segment, index) => {
        if (segment.label === forcedWinner) acc.push(index);
        return acc;
      }, [] as number[]);
      
      winningSegmentIndex = possibleIndices.length > 0
        ? possibleIndices[Math.floor(Math.random() * possibleIndices.length)]
        : Math.floor(Math.random() * NUM_SEGMENTS);
      setForcedWinner(null);
    } else {
      winningSegmentIndex = Math.floor(Math.random() * NUM_SEGMENTS);
    }
    
    const currentWinningSegment = SEGMENTS_CONFIG[winningSegmentIndex];
    
    // Set active multiplier state right before the spin starts for immediate visual feedback
    let multiplierApplied = null;
    if (finalTopSlotResult && finalTopSlotResult.left === currentWinningSegment.label && finalTopSlotResult.right) {
        multiplierApplied = { optionId: currentWinningSegment.label, multiplier: finalTopSlotResult.right };
        setActiveMultiplier(multiplierApplied);
    }

    spinOutcomeRef.current = { winningSegment: currentWinningSegment, topSlotResult: finalTopSlotResult, multiplierApplied };
    
    // --- Calculate Final Rotation ---
    // This logic ensures the wheel lands on the correct segment after a fixed spin duration.
    const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;
    
    const winningSegmentAngle = (winningSegmentIndex * SEGMENT_ANGLE) + (SEGMENT_ANGLE / 2);
    const fullSpins = 5 * 360;
    setRotation(prev => {
      const rotationBase = prev - (prev % 360);
      return rotationBase + fullSpins + (360 - winningSegmentAngle);
    });
    
    gameTimeouts.current.spin = setTimeout(() => {
      processSpinResult();
    }, SPIN_DURATION_SECONDS * 1000);
  }, [forcedWinner, forcedTopSlotLeft, forcedTopSlotRight, processSpinResult]);


  const handleCloseRound = useCallback(() => {
    if (gameState === 'SPINNING' || gameState === 'PRE_BONUS') {
      clearGameTimeouts();
      processSpinResult();
    } else {
      startNewRound();
    }
  }, [gameState, clearGameTimeouts, processSpinResult, startNewRound]);


  // Game Loop Timer
  useEffect(() => {
    if (isPaused) {
      return;
    }
    let timer: NodeJS.Timeout;

    if (gameState === 'BETTING' && countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        gameTimeouts.current.countdown = timer;
    } else if (gameState === 'BETTING' && countdown <= 0) {
        handleSpin();
    } else if (gameState === 'PRE_BONUS') {
      timer = setTimeout(() => {
        if (winningSegment) {
          setGameState(`BONUS_${winningSegment.label}` as any);
        } else {
          startNewRound();
        }
      }, 3000);
      gameTimeouts.current.preBonus = timer;
    } else if (gameState === 'RESULT') {
      timer = setTimeout(() => startNewRound(), RESULT_DISPLAY_SECONDS * 1000);
      gameTimeouts.current.result = timer;
    }

    return () => clearTimeout(timer);
  }, [gameState, countdown, handleSpin, isPaused, startNewRound, winningSegment]);
  
  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
        clearGameTimeouts();
    };
  }, [clearGameTimeouts]);
  
  const handleGenerateAndDownload = () => {
      setIsGenerating(true);
      toast({ title: "Generating Data...", description: "Please wait, this may take a moment." });
      
      setTimeout(() => {
          try {
              const generatedLog = generateHourOfData(skipBetsInDataGen);
              const dataStr = JSON.stringify(generatedLog, null, 2);
              const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
              const downloadLink = document.createElement('a');
              downloadLink.setAttribute('href', dataUri);
              downloadLink.setAttribute('download', `wheel_of_fortune_1_hour_log_${new Date().toISOString()}.json`);
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);

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
  const topSlotMultiplier = (activeMultiplier && winningSegment && activeMultiplier.optionId === winningSegment.label) 
      ? activeMultiplier.multiplier 
      : 1;

  return (
    <div className="relative flex flex-col min-h-screen text-foreground overflow-y-auto">
      <TransitionOverlay />
      <Image
        alt="Game background"
        src={assetUrls['background'] || 'https://placehold.co/1920x1080.png'}
        data-ai-hint="carnival night"
        fill
        className="object-cover z-[-2]"
        priority
      />
      <div className="absolute inset-0 bg-background/80 z-[-1]"></div>
      
      {gameState === 'BETTING' && !isPaused && (() => {
          const radius = 24;
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
                  <div className="relative h-16 w-16">
                      <svg className="w-full h-full" viewBox="0 0 52 52">
                          <circle
                              className="stroke-current text-foreground/20"
                              strokeWidth="4"
                              fill="transparent"
                              r={radius}
                              cx="26"
                              cy="26"
                          />
                          <circle
                              className={cn(
                                  "stroke-current",
                                  getTimerColor()
                              )}
                              strokeWidth="4"
                              strokeDasharray={circumference}
                              strokeDashoffset={strokeDashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                              r={radius}
                              cx="26"
                              cy="26"
                              transform="rotate(-90 26 26)"
                              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease-in-out' }}
                          />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-headline text-foreground">{Math.max(0, countdown)}</span>
                      </div>
                  </div>
              </div>
          );
      })()}

      {gameState === 'BONUS_COIN_FLIP' && <CoinFlipBonus betAmount={bets['COIN_FLIP']} onComplete={handleBonusComplete} topSlotMultiplier={topSlotMultiplier} />}
      {gameState === 'BONUS_PACHINKO' && <PachinkoBonus betAmount={bets['PACHINKO']} onComplete={handleBonusComplete} topSlotMultiplier={topSlotMultiplier} />}
      {gameState === 'BONUS_CASH_HUNT' && <CashHuntBonus betAmount={bets['CASH_HUNT']} onComplete={handleBonusComplete} topSlotMultiplier={topSlotMultiplier} />}
      {gameState === 'BONUS_CRAZY_TIME' && <CrazyTimeBonus betAmount={bets['CRAZY_TIME']} onComplete={handleBonusComplete} topSlotMultiplier={topSlotMultiplier} />}
      {gameState === 'NUMBER_RESULT' && winningSegment && (
        <NumberResultPopup
            winningSegment={winningSegment}
            onComplete={handleNumberResultComplete}
            customTextureUrl={assetUrls[`result-popup-${winningSegment.label}`]}
            totalWinnings={roundWinnings}
        />
      )}

      {!isBonusActive && (
        <div className="flex-grow flex flex-col">
            <GameHeader
                balance={balance}
                user={user}
                signOut={signOut}
            />
            <main className="flex-grow w-full max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* --- Left Column --- */}
                <div className="lg:sticky lg:top-24 flex flex-col items-center justify-start gap-4">
                    <div className="my-2 z-20">
                        <TopSlot isSpinning={isTopSlotSpinning} result={topSlotResult} assetUrls={assetUrls} hideText={hideText} />
                    </div>
                    <div className="relative flex flex-col items-center">
                        <Wheel segments={SEGMENTS_CONFIG} rotation={rotation} assetUrls={assetUrls} hideText={hideText} textureRotation={textureRotation} />
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
                                ></div>
                                <div
                                    className="absolute top-0 left-0 w-full h-4 rounded-[100%_/_100%]"
                                    style={{
                                        background: 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--primary)/0.8))',
                                        border: '2px solid hsl(var(--accent)/0.3)',
                                        boxShadow: 'inset 0 2px 4px hsl(var(--accent)/0.2)',
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>
                    <GameHistory spinHistory={spinHistory} assetUrls={assetUrls} />
                </div>
                
                {/* --- Right Column --- */}
                <div className="flex flex-col items-center justify-between gap-4 w-full">
                    <GameStatusDisplay
                        gameState={gameState}
                        isPaused={isPaused}
                    />
                    <div className="w-full max-w-md">
                        <BettingInterface
                            bets={bets}
                            handleBet={handleBet}
                            gameState={gameState}
                            isPaused={isPaused}
                            chipValues={chipValues}
                            selectedChip={selectedChip}
                            setSelectedChip={setSelectedChip}
                            handleUndoBet={handleUndoBet}
                            handleClearBets={handleClearBets}
                            totalBet={totalBet}
                            assetUrls={assetUrls}
                            hideText={hideText}
                            activeMultiplier={activeMultiplier}
                        />
                    </div>
                </div>
            </main>
          
          <footer className="w-full px-4 pt-4">
              <DevTools
                showLegend={showLegend}
                setShowLegend={setShowLegend}
                setIsTopSlotSpinning={setIsTopSlotSpinning}
                handleSkipCountdown={handleSkipCountdown}
                gameState={gameState}
                isPaused={isPaused}
                handleCloseRound={handleCloseRound}
                setIsPaused={setIsPaused}
                handleDownloadLatestSpinData={handleDownloadLatestSpinData}
                gameLog={gameLog}
                handleGenerateAndDownload={handleGenerateAndDownload}
                isGenerating={isGenerating}
                handleDownloadLog={handleDownloadLog}
                hideText={hideText}
                setHideText={setHideText}
                textureRotation={textureRotation}
                setTextureRotation={setTextureRotation}
                assetUrls={assetUrls}
                skipBetsInDataGen={skipBetsInDataGen}
                setSkipBetsInDataGen={setSkipBetsInDataGen}
                forcedWinner={forcedWinner}
                setForcedWinner={setForcedWinner}
                forcedTopSlotLeft={forcedTopSlotLeft}
                setForcedTopSlotLeft={setForcedTopSlotLeft}
                forcedTopSlotRight={forcedTopSlotRight}
                setForcedTopSlotRight={setForcedTopSlotRight}
              />
          </footer>
        </div>
      )}
    </div>
  );
}

    