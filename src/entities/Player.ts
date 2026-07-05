import { ActiveEffect, createEffect } from './Effect';
import { CardInstance } from './Card';
import { CardDefinition, CardEffect } from '../data/cards';
import { getCardDef } from '../data/cards';
import { shuffleArray } from '../utils/helpers';

export class Player {
  maxHp: number;
  hp: number;
  maxEnergy: number;
  energy: number;
  block: number;

  drawPile: CardInstance[];
  hand: CardInstance[];
  discardPile: CardInstance[];
  exhaustPile: CardInstance[];

  effects: ActiveEffect[];
  strength: number;

  constructor(maxHp: number, maxEnergy: number, starterDeckIds: string[]) {
    this.maxHp = maxHp;
    this.hp = maxHp;
    this.maxEnergy = maxEnergy;
    this.energy = maxEnergy;
    this.block = 0;
    this.strength = 0;
    this.effects = [];

    this.drawPile = [];
    this.hand = [];
    this.discardPile = [];
    this.exhaustPile = [];

    const deck = starterDeckIds.map((id) => new CardInstance(getCardDef(id)));
    this.drawPile = shuffleArray(deck);
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }

  get totalEffects(): ActiveEffect[] {
    return this.effects;
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

  removeEffect(name: string): void {
    this.effects = this.effects.filter((e) => e.name !== name);
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

  drawCards(count: number): CardInstance[] {
    const drawn: CardInstance[] = [];
    for (let i = 0; i < count; i++) {
      if (this.drawPile.length === 0) {
        if (this.discardPile.length === 0) break;
        this.drawPile = shuffleArray(this.discardPile);
        this.discardPile = [];
      }
      const card = this.drawPile.pop();
      if (card) {
        this.hand.push(card);
        drawn.push(card);
      }
    }
    return drawn;
  }

  playCard(handIndex: number): CardInstance | null {
    if (handIndex < 0 || handIndex >= this.hand.length) return null;
    const card = this.hand[handIndex];
    if (this.energy < card.cost) return null;
    this.energy -= card.cost;
    this.hand.splice(handIndex, 1);
    return card;
  }

  discardHand(): void {
    this.discardPile.push(...this.hand);
    this.hand = [];
  }

  gainBlock(amount: number): void {
    this.block += amount;
  }

  takeDamage(amount: number): number {
    const blocked = Math.min(this.block, amount);
    this.block -= blocked;
    const actual = amount - blocked;
    this.hp = Math.max(0, this.hp - actual);
    return actual;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  resetBlock(): void {
    this.block = 0;
  }

  startNewTurn(): void {
    this.energy = this.maxEnergy;
    this.drawCards(5);
  }

  die(): void {
    this.hp = 0;
  }
}
