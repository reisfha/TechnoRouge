export interface EnemyIntent {
  type: 'attack' | 'buff' | 'debuff' | 'defend' | 'status';
  value?: number;
  effectType?: string;
  effectValue?: number;
  duration?: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  maxHp: number;
  minHp: number;
  intents: EnemyIntent[];
  intentCount: number;
  artifact?: string;
}

export const ENEMY_DEFINITIONS: EnemyDefinition[] = [
  {
    id: 'patrol_ice',
    name: 'Patrol ICE',
    maxHp: 30,
    minHp: 24,
    intents: [
      { type: 'attack', value: 6 },
      { type: 'attack', value: 8 },
      { type: 'defend', value: 5 },
    ],
    intentCount: 3,
  },
  {
    id: 'firewall_daemon',
    name: 'Firewall Daemon',
    maxHp: 40,
    minHp: 34,
    intents: [
      { type: 'attack', value: 10 },
      { type: 'defend', value: 8 },
      { type: 'buff', effectType: 'strength', effectValue: 2, duration: 99 },
    ],
    intentCount: 3,
  },
  {
    id: 'corrupted_node',
    name: 'Corrupted Node',
    maxHp: 25,
    minHp: 20,
    intents: [
      { type: 'attack', value: 5 },
      { type: 'debuff', effectType: 'weak', effectValue: 1, duration: 2 },
      { type: 'status', effectType: 'poison', effectValue: 3, duration: 3 },
    ],
    intentCount: 3,
  },
  {
    id: 'data_vampire',
    name: 'Data Vampire',
    maxHp: 35,
    minHp: 30,
    intents: [
      { type: 'attack', value: 7 },
      { type: 'attack', value: 7 },
      { type: 'buff', effectType: 'strength', effectValue: 1, duration: 99 },
      { type: 'defend', value: 6 },
    ],
    intentCount: 4,
  },
  {
    id: 'system_guardian',
    name: 'System Guardian',
    maxHp: 55,
    minHp: 48,
    intents: [
      { type: 'attack', value: 12 },
      { type: 'attack', value: 12 },
      { type: 'defend', value: 10 },
      { type: 'buff', effectType: 'strength', effectValue: 3, duration: 99 },
    ],
    intentCount: 4,
  },
];

export function getEnemyDef(id: string): EnemyDefinition {
  const def = ENEMY_DEFINITIONS.find((e) => e.id === id);
  if (!def) throw new Error(`Enemy definition not found: ${id}`);
  return def;
}
