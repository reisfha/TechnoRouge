export type CardType = 'code' | 'firewall' | 'daemon' | 'virus' | 'ice' | 'protocol';
export type TargetType = 'enemy' | 'self' | 'all_enemies' | 'all';
export type Rarity = 'basic' | 'common' | 'uncommon' | 'rare';

export interface CardEffect {
  type: 'damage' | 'block' | 'apply_effect' | 'gain_energy' | 'heal' | 'draw' | 'aoe_damage';
  value?: number;
  effectType?: string;
  duration?: number;
  target?: TargetType;
}

export interface CardDefinition {
  id: string;
  name: string;
  cost: number;
  type: CardType;
  target: TargetType;
  description: string;
  rarity: Rarity;
  effects: CardEffect[];
}

export const CARD_DEFINITIONS: CardDefinition[] = [
  {
    id: 'strike',
    name: 'Strike',
    cost: 1,
    type: 'code',
    target: 'enemy',
    description: 'Deal 6 damage.',
    rarity: 'basic',
    effects: [{ type: 'damage', value: 6 }],
  },
  {
    id: 'defend',
    name: 'Defend',
    cost: 1,
    type: 'firewall',
    target: 'self',
    description: 'Gain 5 block.',
    rarity: 'basic',
    effects: [{ type: 'block', value: 5 }],
  },
  {
    id: 'inject',
    name: 'Inject',
    cost: 2,
    type: 'code',
    target: 'enemy',
    description: 'Deal 12 damage.',
    rarity: 'common',
    effects: [{ type: 'damage', value: 12 }],
  },
  {
    id: 'barrier',
    name: 'Barrier',
    cost: 2,
    type: 'firewall',
    target: 'self',
    description: 'Gain 10 block.',
    rarity: 'common',
    effects: [{ type: 'block', value: 10 }],
  },
  {
    id: 'overclock',
    name: 'Overclock',
    cost: 0,
    type: 'daemon',
    target: 'self',
    description: 'Gain 1 energy.',
    rarity: 'common',
    effects: [{ type: 'gain_energy', value: 1 }],
  },
  {
    id: 'worm',
    name: 'Worm',
    cost: 1,
    type: 'virus',
    target: 'enemy',
    description: 'Apply 3 poison.',
    rarity: 'common',
    effects: [{ type: 'apply_effect', effectType: 'poison', value: 3, duration: 3 }],
  },
  {
    id: 'turbo',
    name: 'Turbo',
    cost: 1,
    type: 'daemon',
    target: 'self',
    description: 'Draw 2 cards.',
    rarity: 'common',
    effects: [{ type: 'draw', value: 2 }],
  },
  {
    id: 'overload',
    name: 'Overload',
    cost: 1,
    type: 'code',
    target: 'enemy',
    description: 'Deal 4 damage. Apply 2 vulnerable.',
    rarity: 'uncommon',
    effects: [
      { type: 'damage', value: 4 },
      { type: 'apply_effect', effectType: 'vulnerable', value: 1, duration: 2 },
    ],
  },
  {
    id: 'fortify',
    name: 'Fortify',
    cost: 1,
    type: 'firewall',
    target: 'self',
    description: 'Gain 6 block. Gain 1 strength.',
    rarity: 'uncommon',
    effects: [
      { type: 'block', value: 6 },
      { type: 'apply_effect', effectType: 'strength', value: 1, duration: 99 },
    ],
  },
  {
    id: 'data_leak',
    name: 'Data Leak',
    cost: 2,
    type: 'virus',
    target: 'enemy',
    description: 'Apply 5 poison. Deal 3 damage.',
    rarity: 'uncommon',
    effects: [
      { type: 'apply_effect', effectType: 'poison', value: 5, duration: 3 },
      { type: 'damage', value: 3 },
    ],
  },
  {
    id: 'recompile',
    name: 'Recompile',
    cost: 0,
    type: 'ice',
    target: 'self',
    description: 'Shuffle 2 random cards from discard into your hand.',
    rarity: 'uncommon',
    effects: [{ type: 'draw', value: 2 }],
  },
  {
    id: 'neural_blitz',
    name: 'Neural Blitz',
    cost: 3,
    type: 'code',
    target: 'all_enemies',
    description: 'Deal 8 damage to all enemies.',
    rarity: 'rare',
    effects: [{ type: 'aoe_damage', value: 8 }],
  },
];

export function getCardDef(id: string): CardDefinition {
  const def = CARD_DEFINITIONS.find((c) => c.id === id);
  if (!def) throw new Error(`Card definition not found: ${id}`);
  return def;
}
