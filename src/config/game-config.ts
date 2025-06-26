
export const BET_OPTIONS = [
  { id: '1', label: '1', type: 'number', color: 'hsl(220, 15%, 85%)', textColor: 'hsl(var(--background))' },
  { id: '2', label: '2', type: 'number', color: 'hsl(210, 80%, 55%)', textColor: 'white' },
  { id: '5', label: '5', type: 'number', color: 'hsl(140, 60%, 50%)', textColor: 'white' },
  { id: '10', label: '10', type: 'number', color: 'hsl(280, 80%, 65%)', textColor: 'white' },
  { id: 'COIN_FLIP', label: 'Coin Flip', type: 'bonus', color: 'hsl(45, 90%, 60%)', textColor: 'hsl(var(--background))' },
  { id: 'PACHINKO', label: 'Pachinko', type: 'bonus', color: 'hsl(320, 70%, 60%)', textColor: 'white' },
  { id: 'CASH_HUNT', label: 'Cash Hunt', type: 'bonus', color: 'hsl(100, 60%, 60%)', textColor: 'hsl(var(--background))' },
  { id: 'CRAZY_TIME', label: 'Crazy Time', type: 'bonus', color: 'hsl(0, 80%, 60%)', textColor: 'white' },
];

export const BET_OPTION_INDEX_MAP = BET_OPTIONS.reduce((acc, option, index) => {
    acc[option.id] = index;
    return acc;
}, {} as Record<string, number>);

export const textColorMap = BET_OPTIONS.reduce((acc, option) => {
  acc[option.id] = option.textColor;
  return acc;
}, {} as Record<string, string>);

// The user-provided wheel segment configuration
const baseSegments = [
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
];

export const SEGMENTS_CONFIG = baseSegments.map((seg, index) => {
    const betOption = BET_OPTIONS.find(bo => bo.id === seg.label);
    if (!betOption) {
        // Fallback for labels that don't have a direct match in BET_OPTIONS
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


export const NUM_SEGMENTS = SEGMENTS_CONFIG.length;
export const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

export const SPIN_DURATION_SECONDS = 12;
export const BETTING_TIME_SECONDS = 15;
export const RESULT_DISPLAY_SECONDS = 5;
export const TOP_SLOT_ANIMATION_DURATION_MS = 3500;

// Rebalanced to reduce the probability of '1' appearing.
export const TOP_SLOT_LEFT_REEL_ITEMS = [ '1', '5', '2', '10', 'COIN_FLIP', '2', '1', 'PACHINKO', '5', '2', 'CASH_HUNT', '10', '1', '5', '2', 'COIN_FLIP', '1', '10', '2', '5', 'PACHINKO', '2', 'CRAZY_TIME', '5', '1', ];
export const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];


export const CHIP_VALUES = [1, 5, 10, 25, 100];
export const initialBetsState = BET_OPTIONS.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});

export type GameLogEntry = {
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

export const adjustHsl = (hsl: string, h: number, l: number) => {
  const [hue, saturation, lightness] = hsl.match(/\d+/g)!.map(Number);
  return `hsl(${hue + h}, ${saturation}%, ${lightness + l}%)`;
}
