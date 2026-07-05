import { ActiveEffect, createEffect } from './Effect';
import { EnemyDefinition, EnemyIntent } from '../data/enemies';

export class Enemy {
  def: EnemyDefinition;
  hp: number;
  maxHp: number;
  block: number;
  effects: ActiveEffect[];
  strength: number;
  currentIntent: EnemyIntent | null;
  turnCount: number;

  constructor(def: EnemyDefinition, hpOverride?: number) {
    this.def = def;
    this.maxHp = hpOverride ?? Math.floor(Math.random() * (def.maxHp - def.minHp + 1) + def.minHp);
    this.hp = this.maxHp;
    this.block = 0;
    this.effects = [];
    this.strength = 0;
    this.currentIntent = null;
    this.turnCount = 0;
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }

  get name(): string {
    return this.def.name;
  }

  getEffectStacks(name: string): number {
    const effect = this.effects.find((e) => e.name === name);
    return effect ? effect.stacks : 0;
  }

  addEffect(name: string, type: 'buff' | 'debuff', stacks: number, duration: number): void {
    const existing = this.effects.find((e) => e.name === name);
    if (existing) {
      existing.stacks += stacks;
      if (duration > existing.turnsRemaining) {
        existing.turnsRemaining = duration;
      }
    } else {
      this.effects.push(createEffect(name, type, stacks, duration));
    }
  }

  tickEffects(): void {
    this.effects = this.effects.filter((e) => {
      e.turnsRemaining--;
      return e.turnsRemaining > 0 && e.stacks > 0;
    });
  }

  applyStatusDamage(): number {
    const poisonStacks = this.getEffectStacks('poison');
    return poisonStacks;
  }

  chooseIntent(): EnemyIntent {
    this.turnCount++;
    const index = (this.turnCount - 1) % this.def.intents.length;
    this.currentIntent = this.def.intents[index];
    return this.currentIntent;
  }

  gainBlock(amount: number): void {
    this.block += amount;
  }

  takeDamage(amount: number): number {
    const vulnerable = this.getEffectStacks('vulnerable');
    if (vulnerable > 0) {
      amount = Math.floor(amount * 1.5);
    }
    const blocked = Math.min(this.block, amount);
    this.block -= blocked;
    const actual = amount - blocked;
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  resetBlock(): void {
    this.block = 0;
  }

  die(): void {
    this.hp = 0;
  }
}
