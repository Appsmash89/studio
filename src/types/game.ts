
import type { SEGMENTS_CONFIG } from '@/config/game-config';

export type GameState =
  | 'BETTING'
  | 'SPINNING'
  | 'RESULT'
  | 'NUMBER_RESULT'
  | 'PRE_BONUS'
  | 'BONUS_COIN_FLIP'
  | 'BONUS_PACHINKO'
  | 'BONUS_CASH_HUNT'
  | 'BONUS_CRAZY_TIME';

export type GameSegment = (typeof SEGMENTS_CONFIG)[0];

export type Bets = { [key: string]: number };

export type BetHistory = { optionId: string; amount: number }[];

export type TopSlotResult = { left: string | null; right: number | null };

export type GameLogEntry = {
  spinId: number;
  timestamp: string;
  bets: Bets;
  totalBet: number;
  winningSegment: {
    label: string;
    type: string;
    multiplier: number;
    index: number;
  };
  topSlotResult?: TopSlotResult & {
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
