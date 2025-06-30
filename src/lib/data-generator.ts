
import {
  BET_OPTION_INDEX_MAP,
  BET_OPTIONS,
  initialBetsState,
  NUM_SEGMENTS,
  SEGMENTS_CONFIG,
  TOP_SLOT_LEFT_REEL_ITEMS,
  TOP_SLOT_RIGHT_REEL_ITEMS,
  getChipValues,
} from '@/config/game-config';
import type { GameLogEntry } from '@/types/game';

const MAX_MULTIPLIER = 20000;

const INITIAL_CRAZY_TIME_SEGMENTS: { value: number | 'DOUBLE' | 'TRIPLE', color: string }[] = [ { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'DOUBLE', color: 'hsl(45, 90%, 60%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 15, color: 'hsl(320, 70%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 7, color: 'hsl(140, 60%, 50%)' }, { value: 10, color: 'hsl(280, 80%, 65%)' }, { value: 'TRIPLE', color: 'hsl(0, 80%, 60%)' }, { value: 5, color: 'hsl(210, 80%, 55%)' }, { value: 20, color: 'hsl(100, 60%, 60%)' }, ];

// Helper to simulate random bets
const simulateRandomBets = () => {
    const bets: { [key: string]: number } = { ...initialBetsState };
    let totalBet = 0;
    const numBets = Math.floor(Math.random() * 4) + 1; // 1 to 4 bets
    const betOptionsCopy = [...BET_OPTIONS];
    const chipValues = getChipValues(1000); // Assume a mid-range balance for generation

    for (let i = 0; i < numBets; i++) {
        if (betOptionsCopy.length === 0) break;
        const randIndex = Math.floor(Math.random() * betOptionsCopy.length);
        const betOption = betOptionsCopy.splice(randIndex, 1)[0];
        const chipValue = chipValues[Math.floor(Math.random() * chipValues.length)];
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


export const generateHourOfData = (skipBetsInDataGen: boolean): GameLogEntry[] => {
    const NUM_SPINS_IN_HOUR = 120; // Approximate
    const generatedLog: GameLogEntry[] = [];
    
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
    
    return generatedLog;
};
