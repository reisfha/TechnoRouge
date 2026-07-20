export interface ClassDefinition {
  id: string;
  name: string;
  description: string;
  maxHp: number;
  maxEnergy: number;
  starterDeck: string[];
  color: string;
}

export const CLASS_DEFINITIONS: ClassDefinition[] = [
  {
    id: 'netrunner',
    name: 'Netrunner',
    description: 'Balanced operator with versatile code.',
    maxHp: 75,
    maxEnergy: 3,
    starterDeck: ['strike', 'strike', 'strike', 'defend', 'defend', 'defend', 'inject', 'barrier', 'overclock', 'turbo'],
    color: '#44aaff',
  },
  {
    id: 'cracker',
    name: 'Cracker',
    description: 'Aggressive attacker focused on raw damage.',
    maxHp: 65,
    maxEnergy: 3,
    starterDeck: ['strike', 'strike', 'strike', 'strike', 'strike', 'defend', 'defend', 'inject', 'neural_blitz', 'overload'],
    color: '#ff4444',
  },
  {
    id: 'guardian',
    name: 'Guardian',
    description: 'Tanky defender with superior shielding.',
    maxHp: 90,
    maxEnergy: 3,
    starterDeck: ['strike', 'strike', 'defend', 'defend', 'defend', 'defend', 'barrier', 'barrier', 'fortify', 'overclock'],
    color: '#44ffcc',
  },
  {
    id: 'infectant',
    name: 'Infectant',
    description: 'Status specialist using viruses and corrosion.',
    maxHp: 70,
    maxEnergy: 3,
    starterDeck: ['strike', 'strike', 'defend', 'defend', 'worm', 'worm', 'data_leak', 'overclock', 'turbo', 'overload'],
    color: '#44ff44',
  },
];
