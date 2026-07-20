import { CardWidget } from './CardWidget';
import { CardInstance } from '../entities/Card';

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

    hand.forEach((card, i) => {
      const widget = new CardWidget(card, i);
      const playable = canPlayFn(i);
      widget.setPlayable(playable);

      widget.setOnClick(() => {
        if (this.onPlayCard) {
          this.onPlayCard(i);
        }
      });

      this.container.appendChild(widget.element);
      this.widgets.push(widget);
    });
  }

  updatePlayability(canPlayFn: (index: number) => boolean): void {
    this.widgets.forEach((w, i) => {
      w.setPlayable(canPlayFn(i));
    });
  }

  clear(): void {
    this.widgets.forEach((w) => w.destroy());
    this.widgets = [];
  }
}
