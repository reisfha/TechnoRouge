import { EnemyState, EnemyIntent } from './types';

export interface EnemyDef {
  enemyId: string;
  name: string;
  hp: [number, number];
  act: number;
  type: 'normal' | 'elite' | 'boss';
  getIntent: (turnIndex: number, self: EnemyState) => EnemyIntent;
}

const enemyDefs: EnemyDef[] = [
  // ACT 1 NORMAL
  { enemyId: 'e1_punk', name: 'Street Punk', hp: [40, 50], act: 1, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 8 } : { type: 'DEFEND', value: 6 } },
  { enemyId: 'e1_drone', name: 'Security Drone', hp: [35, 45], act: 1, type: 'normal', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 6 } : { type: 'DEBUFF', description: 'Apply 1 Weak' } },
  { enemyId: 'e1_guard', name: 'Corporate Guard', hp: [50, 60], act: 1, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'DEFEND', value: 10 } : { type: 'ATTACK', value: 9 } },
  { enemyId: 'e1_hacker', name: 'Rogue Hacker', hp: [30, 40], act: 1, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 12 } : { type: 'DEBUFF', description: 'Apply 1 Vulnerable' } },
  { enemyId: 'e1_hound', name: 'Cyber Hound', hp: [45, 55], act: 1, type: 'normal', getIntent: (t) => t % 4 === 3 ? { type: 'DEFEND', value: 8 } : { type: 'ATTACK', value: 7 } },
  
  // ACT 1 ELITE
  { enemyId: 'e1_elite_thief', name: 'Data Thief', hp: [70, 85], act: 1, type: 'elite', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 14 } : { type: 'DEBUFF', description: 'Apply 2 Weak' } },
  { enemyId: 'e1_elite_mech', name: 'Heavy Mech', hp: [90, 100], act: 1, type: 'elite', getIntent: (t) => t % 3 === 0 ? { type: 'BUFF', description: 'Gain 2 Strength' } : { type: 'ATTACK', value: 10 } },

  // ACT 1 BOSS
  { enemyId: 'e1_boss_goon', name: 'Overseer Goon', hp: [140, 150], act: 1, type: 'boss', getIntent: (t, self) => {
      const p2 = self.hp <= self.maxHp / 2;
      return p2 ? (t % 2 === 0 ? { type: 'ATTACK', value: 18 } : { type: 'BUFF', description: 'Gain 1 Strength' }) 
                : (t % 3 === 0 ? { type: 'ATTACK', value: 12 } : { type: 'DEFEND', value: 15 });
  }},

  // ACT 2 NORMAL
  { enemyId: 'e2_suit', name: 'Corpo Suit', hp: [60, 70], act: 2, type: 'normal', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 12 } : { type: 'DEFEND', value: 12 } },
  { enemyId: 'e2_turret', name: 'Auto-Turret', hp: [50, 60], act: 2, type: 'normal', getIntent: (t) => ({ type: 'ATTACK', value: 10 + t }) },
  { enemyId: 'e2_ninja', name: 'Neon Ninja', hp: [55, 65], act: 2, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 8, secondaryValue: 2 } : { type: 'DEBUFF', description: 'Apply 1 Vulnerable' } }, // hits twice logic can be faked or implemented
  { enemyId: 'e2_enforcer', name: 'Enforcer', hp: [80, 90], act: 2, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'DEFEND', value: 20 } : { type: 'ATTACK', value: 14 } },
  { enemyId: 'e2_sniper', name: 'Sniper', hp: [45, 50], act: 2, type: 'normal', getIntent: (t) => t % 4 === 3 ? { type: 'ATTACK', value: 30 } : { type: 'BUFF', description: 'Aiming' } },

  // ACT 2 ELITE
  { enemyId: 'e2_elite_tank', name: 'Riot Tank', hp: [120, 140], act: 2, type: 'elite', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 20 } : { type: 'DEFEND', value: 15 } },
  { enemyId: 'e2_elite_assassin', name: 'Cyber Assassin', hp: [100, 110], act: 2, type: 'elite', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 15 } : { type: 'DEBUFF', description: 'Apply 2 Vulnerable' } },

  // ACT 2 BOSS
  { enemyId: 'e2_boss_kira', name: 'Director Kira', hp: [200, 220], act: 2, type: 'boss', getIntent: (t) => {
      if (t % 4 === 0) return { type: 'DEFEND', value: 30 };
      if (t % 4 === 1) return { type: 'ATTACK', value: 15 };
      if (t % 4 === 2) return { type: 'DEBUFF', description: 'Apply 2 Weak & 2 Vulnerable' };
      return { type: 'ATTACK', value: 20 };
  }},

  // ACT 3 NORMAL
  { enemyId: 'e3_glitch', name: 'Glitch Entity', hp: [80, 90], act: 3, type: 'normal', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 18 } : { type: 'DEBUFF', description: 'Apply 2 Weak' } },
  { enemyId: 'e3_proxy', name: 'Proxy Node', hp: [75, 85], act: 3, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'BUFF', description: 'Gain 3 Strength' } : { type: 'ATTACK', value: 12 } },
  { enemyId: 'e3_warden', name: 'Core Warden', hp: [100, 110], act: 3, type: 'normal', getIntent: (t) => t % 3 === 0 ? { type: 'DEFEND', value: 25 } : { type: 'ATTACK', value: 16 } },
  { enemyId: 'e3_virus', name: 'Rogue Virus', hp: [60, 70], act: 3, type: 'normal', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 14 } : { type: 'BUFF', description: 'Gain 1 Strength' } },

  // ACT 3 ELITE
  { enemyId: 'e3_elite_dragon', name: 'Data Dragon', hp: [180, 200], act: 3, type: 'elite', getIntent: (t) => t % 3 === 0 ? { type: 'ATTACK', value: 25 } : { type: 'DEBUFF', description: 'Apply 2 Burn' } },
  { enemyId: 'e3_elite_mirror', name: 'Mirror Image', hp: [150, 160], act: 3, type: 'elite', getIntent: (t) => t % 2 === 0 ? { type: 'ATTACK', value: 18 } : { type: 'DEFEND', value: 20 } },

  // ACT 3 BOSS
  { enemyId: 'e3_boss_overseer', name: 'OVERSEER AI', hp: [300, 300], act: 3, type: 'boss', getIntent: (t, self) => {
      const phase = self.hp > 200 ? 1 : self.hp > 100 ? 2 : 3;
      if (phase === 1) return t % 2 === 0 ? { type: 'ATTACK', value: 20 } : { type: 'DEFEND', value: 25 };
      if (phase === 2) return t % 2 === 0 ? { type: 'ATTACK', value: 25 } : { type: 'DEBUFF', description: 'Apply 2 Weak & Vuln' };
      return t % 2 === 0 ? { type: 'ATTACK', value: 35 } : { type: 'BUFF', description: 'Gain 3 Strength' };
  }}
];

export const getRandomEnemies = (act: number, type: 'normal' | 'elite' | 'boss'): EnemyState[] => {
  const pool = enemyDefs.filter(e => e.act === act && e.type === type);
  const def = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : enemyDefs.find(e => e.enemyId === 'e1_punk')!;
  const hp = Math.floor(Math.random() * (def.hp[1] - def.hp[0] + 1)) + def.hp[0];
  
  const enemy: EnemyState = {
    id: Math.random().toString(36).substring(2, 11),
    enemyId: def.enemyId,
    name: def.name,
    hp,
    maxHp: hp,
    block: 0,
    statusEffects: { strength: 0, dexterity: 0, vulnerable: 0, weak: 0, virus: 0, burn: 0, stunned: 0, momentum: 0, fortify: 0, poison: 0 },
    currentTurnIndex: 0,
    intent: null
  };
  enemy.intent = def.getIntent(0, enemy);
  return [enemy];
};

export const getNextIntent = (enemy: EnemyState): EnemyIntent => {
  const def = enemyDefs.find(e => e.enemyId === enemy.enemyId);
  if (!def) return { type: 'ATTACK', value: 5 };
  return def.getIntent(enemy.currentTurnIndex, enemy);
};
