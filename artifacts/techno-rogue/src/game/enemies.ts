import { EnemyState, EnemyIntent } from './types';

export interface EnemyDef {
  enemyId: string;
  name: string;
  hp: [number, number]; // min, max
  act: number;
  type: 'normal' | 'elite' | 'boss';
  spriteUrl?: string;
  getIntent: (turnIndex: number, self: EnemyState) => EnemyIntent;
}

const enemyDefs: EnemyDef[] = [
  // ACT 1 NORMAL
  {
    enemyId: 'e_street_punk',
    name: 'Street Punk',
    hp: [40, 50],
    act: 1,
    type: 'normal',
    getIntent: (turn) => {
      const pattern = turn % 3;
      if (pattern === 0) return { type: 'ATTACK', value: 8 };
      if (pattern === 1) return { type: 'ATTACK', value: 8 };
      return { type: 'DEFEND', value: 6 };
    }
  },
  {
    enemyId: 'e_security_drone',
    name: 'Security Drone',
    hp: [35, 45],
    act: 1,
    type: 'normal',
    getIntent: (turn) => {
      const pattern = turn % 4;
      if (pattern === 0) return { type: 'ATTACK', value: 5 };
      if (pattern === 1) return { type: 'ATTACK', value: 5 };
      if (pattern === 2) return { type: 'ATTACK', value: 8 };
      return { type: 'DEFEND', value: 8 };
    }
  },
  {
    enemyId: 'e_corp_guard',
    name: 'Corporate Guard',
    hp: [50, 60],
    act: 1,
    type: 'normal',
    getIntent: (turn) => {
      const pattern = turn % 3;
      if (pattern === 0) return { type: 'DEFEND', value: 8 };
      if (pattern === 1) return { type: 'ATTACK', value: 10 };
      return { type: 'ATTACK', value: 10 };
    }
  },
  
  // ACT 1 ELITE
  {
    enemyId: 'e_elite_data_thief',
    name: 'Data Thief',
    hp: [60, 75],
    act: 1,
    type: 'elite',
    getIntent: (turn) => {
      const pattern = turn % 3;
      if (pattern === 0) return { type: 'ATTACK', value: 7 };
      if (pattern === 1) return { type: 'DEBUFF', description: 'Apply 1 Weak' };
      return { type: 'ATTACK', value: 12 };
    }
  },

  // ACT 1 BOSS
  {
    enemyId: 'e_boss_overseer_goon',
    name: 'Overseer Goon',
    hp: [130, 140],
    act: 1,
    type: 'boss',
    getIntent: (turn, self) => {
      const isPhase2 = self.hp <= self.maxHp / 2;
      const pattern = turn % 3;
      
      if (!isPhase2) {
        if (pattern === 0) return { type: 'ATTACK', value: 12 };
        if (pattern === 1) return { type: 'DEFEND', value: 15 };
        return { type: 'ATTACK', value: 12, description: '+ 1 Vulnerable' };
      } else {
        if (pattern === 0) return { type: 'ATTACK', value: 18 };
        if (pattern === 1) return { type: 'DEFEND', value: 20 };
        return { type: 'BUFF', description: 'Gain 2 Strength' };
      }
    }
  }
];

export const getRandomEnemies = (act: number, type: 'normal' | 'elite' | 'boss'): EnemyState[] => {
  const pool = enemyDefs.filter(e => e.act === act && e.type === type);
  if (pool.length === 0) {
    // fallback
    const fallback = enemyDefs.find(e => e.enemyId === 'e_street_punk')!;
    pool.push(fallback);
  }
  
  const def = pool[Math.floor(Math.random() * pool.length)];
  
  const hp = Math.floor(Math.random() * (def.hp[1] - def.hp[0] + 1)) + def.hp[0];
  
  const enemy: EnemyState = {
    id: Math.random().toString(36).substring(2, 11),
    enemyId: def.enemyId,
    name: def.name,
    hp,
    maxHp: hp,
    block: 0,
    statusEffects: {
      strength: 0, dexterity: 0, vulnerable: 0, weak: 0, virus: 0, burn: 0, stunned: 0, momentum: 0
    },
    currentTurnIndex: 0,
    intent: null
  };
  
  // Initialize intent
  enemy.intent = def.getIntent(0, enemy);
  
  // Most fights are 1 enemy for now, maybe add logic for multiple later
  return [enemy];
};

export const getNextIntent = (enemy: EnemyState): EnemyIntent => {
  const def = enemyDefs.find(e => e.enemyId === enemy.enemyId);
  if (!def) return { type: 'ATTACK', value: 5 };
  return def.getIntent(enemy.currentTurnIndex, enemy);
};
