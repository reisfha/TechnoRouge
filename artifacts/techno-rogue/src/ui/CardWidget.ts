import { CardInstance } from '../entities/Card';

const CARD_TYPE_COLORS: Record<string, string> = {
  code: '#ff4455',
  firewall: '#44ddff',
  daemon: '#bb66ff',
  virus: '#44ff66',
  ice: '#ffdd44',
  protocol: '#ffffff',
};

export class CardWidget {
  element: HTMLDivElement;
  private card: CardInstance;
  private onClick: (() => void) | null = null;
  private index: number;

  constructor(card: CardInstance, index: number) {
    this.card = card;
    this.index = index;
    this.element = document.createElement('div');
    this.element.className = 'card';
    this.element.dataset.index = String(index);
    this.render();
  }

  setIndex(index: number): void {
    this.index = index;
    this.element.dataset.index = String(index);
  }

  setOnClick(cb: (() => void) | null): void {
    this.onClick = cb;
  }

  setPlayable(playable: boolean): void {
    this.element.classList.toggle('playable', playable);
    this.element.classList.toggle('unplayable', !playable);
  }

  setHighlight(highlight: boolean): void {
    this.element.classList.toggle('highlight', highlight);
  }

  private render(): void {
    const color = CARD_TYPE_COLORS[this.card.type] || '#ffffff';
    this.element.style.setProperty('--card-color', color);

    this.element.innerHTML = `
      <div class="card-cost">${this.card.cost}</div>
      <div class="card-type-indicator" style="background:${color}"></div>
      <div class="card-name">${this.card.name}</div>
      <div class="card-description">${this.card.description}</div>
    `;

    this.element.addEventListener('click', () => {
      if (this.element.classList.contains('playable') && this.onClick) {
        this.onClick();
      }
    });
  }

  destroy(): void {
    this.element.remove();
  }
}
