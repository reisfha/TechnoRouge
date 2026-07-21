import { CardInstance } from '../entities/Card';
import { CardDefinition } from '../data/cards';
import { shuffleArray } from '../utils/helpers';
import { SeededRNG } from '../rng';

export class DeckSystem {
  static createStarterDeck(defs: CardDefinition[]): CardInstance[] {
    return defs.map((def) => new CardInstance(def));
  }

  static shuffleDeck(deck: CardInstance[], rng?: SeededRNG): CardInstance[] {
    return shuffleArray(deck, rng);
  }

  static drawCards(
    drawPile: CardInstance[],
    hand: CardInstance[],
    discardPile: CardInstance[],
    count: number,
    rng?: SeededRNG
  ): CardInstance[] {
    const drawn: CardInstance[] = [];
    for (let i = 0; i < count; i++) {
      if (drawPile.length === 0) {
        if (discardPile.length === 0) break;
        drawPile.push(...shuffleArray(discardPile.splice(0), rng));
      }
      const card = drawPile.pop();
      if (card) {
        hand.push(card);
        drawn.push(card);
      }
    }
    return drawn;
  }

  static discardCard(hand: CardInstance[], discardPile: CardInstance[], index: number): CardInstance | null {
    if (index < 0 || index >= hand.length) return null;
    const card = hand.splice(index, 1)[0];
    discardPile.push(card);
    return card;
  }

  static discardHand(hand: CardInstance[], discardPile: CardInstance[]): void {
    discardPile.push(...hand);
    hand.length = 0;
  }
}
