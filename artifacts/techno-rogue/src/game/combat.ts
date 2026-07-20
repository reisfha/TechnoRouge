import { Card, Player, EnemyState, CombatEntity } from './types';

export const shuffle = <T>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export const calculateDamage = (baseDamage: number, attacker: CombatEntity, defender: CombatEntity): number => {
  let damage = baseDamage;
  
  damage += attacker.statusEffects.strength;
  if (attacker.statusEffects.temporaryStrength) {
    damage += attacker.statusEffects.temporaryStrength;
  }
  if (attacker.statusEffects.momentum > 0) {
    damage += attacker.statusEffects.momentum;
  }
  
  if (attacker.statusEffects.weak > 0) {
    damage = Math.floor(damage * 0.75);
  }
  
  if (defender.statusEffects.vulnerable > 0) {
    damage = Math.floor(damage * 1.5);
  }
  
  return Math.max(0, damage);
};

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
    burn: Math.max(0, status.burn - 1),
    poison: Math.max(0, status.poison - 1),
    temporaryStrength: 0,
    momentum: 0
  };
};
