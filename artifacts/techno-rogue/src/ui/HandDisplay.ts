import { CardWidget } from './CardWidget';
import { CardInstance } from '@workspace/game-logic';

const MAX_ROTATION_DEG = 24; // max total spread of the fan
const BASE_ANGLE = 5;        // degrees per card

export class HandDisplay {
  private container: HTMLElement;
  private widgets: CardWidget[] = [];
  private onPlayCard: ((index: number) => void) | null = null;

  constructor(containerId: string = 'hand-container') {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  setOnPlayCard(cb: (index: number) => void): void {
    this.onPlayCard = cb;
  }

  render(hand: CardInstance[], canPlayFn: (index: number) => boolean): void {
    this.clear();

    const n = hand.length;
    const spread = Math.min(BASE_ANGLE * (n - 1), MAX_ROTATION_DEG);
    const step = n > 1 ? spread / (n - 1) : 0;

    hand.forEach((card, i) => {
      const widget = new CardWidget(card, i);
      const playable = canPlayFn(i);
      widget.setPlayable(playable);

      // Arc rotation: negative = left tilt, positive = right tilt
      const rotation = n > 1 ? -spread / 2 + step * i : 0;
      widget.setArcTransform(rotation, i, n);

      widget.setOnClick(() => {
        if (this.onPlayCard) this.onPlayCard(i);
      });

      this.container.appendChild(widget.element);
      this.widgets.push(widget);
    });
  }

  updatePlayability(canPlayFn: (index: number) => boolean): void {
    this.widgets.forEach((w, i) => w.setPlayable(canPlayFn(i)));
  }

  clear(): void {
    this.widgets.forEach((w) => w.destroy());
    this.widgets = [];
  }
}
