import { ActiveEffect } from './Effect';
import { CardInstance } from './Card';
import { getCardDef } from '../data/cards';
import { DeckSystem } from '../systems/DeckSystem';
import { EffectSystem } from '../systems/EffectSystem';
import { SeededRNG } from '../rng';

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
  rng?: SeededRNG;

  static readonly MAX_HAND_SIZE = 10;

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
    this.drawPile = DeckSystem.shuffleDeck(deck);
  }

  get isAlive(): boolean {
    return this.hp > 0;
  }

  get totalEffects(): ActiveEffect[] {
    return this.effects;
  }

  getEffectStacks(name: string): number {
    return EffectSystem.getStacks(this.effects, name);
  }

  addEffect(name: string, type: 'buff' | 'debuff', stacks: number, duration: number): void {
    this.effects = EffectSystem.addEffect(this.effects, name, type, stacks, duration);
  }

  removeEffect(name: string): void {
    this.effects = EffectSystem.removeEffect(this.effects, name);
  }

  tickEffects(): void {
    this.effects = EffectSystem.tickEffects(this.effects);
  }

  applyStatusDamage(): number {
    return this.getEffectStacks('poison');
  }

  drawCards(count: number): CardInstance[] {
    return DeckSystem.drawCards(this.drawPile, this.hand, this.discardPile, count, this.rng);
  }

  drawFromDiscard(count: number): CardInstance[] {
    const drawn: CardInstance[] = [];
    for (let i = 0; i < count; i++) {
      if (this.discardPile.length === 0) break;
      const randomIndex = this.rng
        ? this.rng.nextInt(0, this.discardPile.length)
        : Math.floor(Math.random() * this.discardPile.length);
      const card = this.discardPile.splice(randomIndex, 1)[0];
      this.hand.push(card);
      drawn.push(card);
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
    DeckSystem.discardHand(this.hand, this.discardPile);
  }

  discardToHandSize(): void {
    while (this.hand.length > Player.MAX_HAND_SIZE) {
      const card = this.hand.pop()!;
      this.discardPile.push(card);
    }
  }

  exhaustCard(handIndex: number): CardInstance | null {
    if (handIndex < 0 || handIndex >= this.hand.length) return null;
    const card = this.hand.splice(handIndex, 1)[0];
    this.exhaustPile.push(card);
    return card;
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
    this.discardToHandSize();
  }

  die(): void {
    this.hp = 0;
  }
}
