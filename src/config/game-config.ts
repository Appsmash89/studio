
export const ADMIN_EMAILS = [
  'developer@example.com',
  // Add more authorized developer emails here
];

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

export const SPIN_DURATION_SECONDS = 14;
export const BETTING_TIME_SECONDS = 15;
export const RESULT_DISPLAY_SECONDS = 1;
export const TOP_SLOT_ANIMATION_DURATION_MS = 3500;

// Rebalanced to reduce the probability of '1' appearing.
export const TOP_SLOT_LEFT_REEL_ITEMS = [ '1', '5', '2', '10', 'COIN_FLIP', '2', '1', 'PACHINKO', '5', '2', 'CASH_HUNT', '10', '1', '5', '2', 'COIN_FLIP', '1', '10', '2', '5', 'PACHINKO', '2', 'CRAZY_TIME', '5', '1', ];
export const TOP_SLOT_RIGHT_REEL_ITEMS = [2, 3, 5, 7, 10, 15, 20, 50];


const CHIP_TIERS = [
  { maxBalance: 1000, values: [1, 2, 5, 10, 25, 50, 100, 250] },
  { maxBalance: 10000, values: [10, 25, 50, 100, 250, 500, 1000, 2500] },
  { maxBalance: 100000, values: [100, 250, 500, 1000, 2500, 5000, 10000, 25000] },
  { maxBalance: Infinity, values: [1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000] },
];

export const getChipValues = (balance: number): number[] => {
  const tier = CHIP_TIERS.find(t => balance < t.maxBalance);
  const baseChips = tier ? tier.values : CHIP_TIERS[CHIP_TIERS.length - 1].values;
  
  const maxChipAllowed = balance / 2;
  
  const validChips = baseChips.filter(chip => chip <= maxChipAllowed);

  // If filtering leaves no options, but the user has enough balance for the smallest chip,
  // provide just the smallest chip to prevent them from being unable to bet.
  if (validChips.length === 0 && balance >= baseChips[0]) {
    return [baseChips[0]];
  }

  return validChips;
};

export const initialBetsState = BET_OPTIONS.reduce((acc, option) => ({ ...acc, [option.id]: 0 }), {});
