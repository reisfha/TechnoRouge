import { Card, Player, EnemyState, CombatEntity } from './types';

// Array shuffling utility
export const shuffle = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Calculate final damage considering status effects
export const calculateDamage = (baseDamage: number, attacker: CombatEntity, defender: CombatEntity): number => {
  let damage = baseDamage;
  
  // Attacker buffs/debuffs
  damage += attacker.statusEffects.strength;
  if (attacker.statusEffects.temporaryStrength) {
    damage += attacker.statusEffects.temporaryStrength;
  }
  
  if (attacker.statusEffects.weak > 0) {
    damage = Math.floor(damage * 0.75);
  }
  
  // Defender debuffs
  if (defender.statusEffects.vulnerable > 0) {
    damage = Math.floor(damage * 1.5);
  }
  
  return Math.max(0, damage);
};

// Apply damage to an entity, hitting block first
export const applyDamage = (damage: number, target: CombatEntity): { target: CombatEntity, actualDamage: number } => {
  let actualDamage = damage;
  let newBlock = target.block;
  let newHp = target.hp;
  
  if (newBlock > 0) {
    if (newBlock >= actualDamage) {
      newBlock -= actualDamage;
      actualDamage = 0;
    } else {
      actualDamage -= newBlock;
      newBlock = 0;
    }
  }
  
  newHp = Math.max(0, newHp - actualDamage);
  
  return {
    target: {
      ...target,
      block: newBlock,
      hp: newHp
    },
    actualDamage
  };
};

export const reduceStatusDurations = (status: CombatEntity['statusEffects']) => {
  return {
    ...status,
    weak: Math.max(0, status.weak - 1),
    vulnerable: Math.max(0, status.vulnerable - 1),
    stunned: Math.max(0, status.stunned - 1),
    temporaryStrength: 0 // Wears off at end of turn
  };
};
