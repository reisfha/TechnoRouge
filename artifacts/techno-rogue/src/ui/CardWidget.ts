import { CardInstance } from '../entities/Card';

const CARD_TYPE_COLORS: Record<string, string> = {
  code:     '#ff4455',
  firewall: '#44ddff',
  daemon:   '#bb66ff',
  virus:    '#44ff88',
  ice:      '#ffdd44',
  protocol: '#ffffff',
};

const CARD_TYPE_LABELS: Record<string, string> = {
  code:     'CODE',
  firewall: 'WALL',
  daemon:   'DMNN',
  virus:    'VRUS',
  ice:      'ICE ',
  protocol: 'PRTC',
};

const RARITY_GLOW: Record<string, string> = {
  basic:    'rgba(100,100,120,0.4)',
  common:   'rgba(80,180,80,0.35)',
  uncommon: 'rgba(80,120,220,0.45)',
  rare:     'rgba(220,150,30,0.5)',
};

const RARITY_BORDER: Record<string, string> = {
  basic:    '#3a3a5a',
  common:   '#3a6a3a',
  uncommon: '#2a4aaa',
  rare:     '#aa7a10',
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

  setArcTransform(rotation: number, _index: number, _total: number): void {
    this.element.style.setProperty('--card-rotation', `${rotation}deg`);
  }

  private render(): void {
    const color = CARD_TYPE_COLORS[this.card.type] || '#ffffff';
    const typeLabel = CARD_TYPE_LABELS[this.card.type] || '????';
    const rarityGlow = RARITY_GLOW[this.card.def.rarity] || RARITY_GLOW.basic;
    const rarityBorder = RARITY_BORDER[this.card.def.rarity] || RARITY_BORDER.basic;

    this.element.style.setProperty('--card-color', color);
    this.element.style.setProperty('--rarity-glow', rarityGlow);
    this.element.style.setProperty('--rarity-border', rarityBorder);

    // Art pattern: unique gradient per card type
    const artGradients: Record<string, string> = {
      code:     `radial-gradient(ellipse at 30% 40%, ${color}33 0%, transparent 70%), linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 100%)`,
      firewall: `linear-gradient(135deg, #0a1a2a 0%, #0a2a3a 100%), radial-gradient(ellipse at 70% 30%, ${color}22 0%, transparent 60%)`,
      daemon:   `radial-gradient(circle at 50% 50%, ${color}22 0%, transparent 65%), linear-gradient(160deg, #1a0a2a 0%, #0a0a1a 100%)`,
      virus:    `radial-gradient(ellipse at 50% 80%, ${color}33 0%, transparent 60%), linear-gradient(180deg, #0a1a0a 0%, #0a0a0a 100%)`,
      ice:      `linear-gradient(45deg, #0a0a1a 0%, #1a1a0a 50%, #0a0a1a 100%)`,
      protocol: `linear-gradient(135deg, #1a1a2a 0%, #0a0a0a 100%)`,
    };
    const artBg = artGradients[this.card.type] || artGradients.protocol;

    this.element.innerHTML = `
      <div class="card-cost">${this.card.cost}</div>
      <div class="card-name">${this.card.name}</div>
      <div class="card-art" style="background:${artBg}">
        <div class="card-art-symbol" style="color:${color}">${this.getArtSymbol()}</div>
      </div>
      <div class="card-type-row">
        <div class="card-type-pip" style="background:${color}"></div>
        <span class="card-type-label" style="color:${color}">${typeLabel}</span>
        <div class="card-type-pip" style="background:${color}"></div>
      </div>
      <div class="card-description">${this.card.description}</div>
      ${this.card.def.exhaust ? '<div class="card-exhaust-tag">EXHAUST</div>' : ''}
    `;

    this.element.addEventListener('click', () => {
      if (this.element.classList.contains('playable') && this.onClick) {
        this.onClick();
      }
    });
  }

  private getArtSymbol(): string {
    const symbols: Record<string, string> = {
      code:     '⟨/⟩',
      firewall: '◈',
      daemon:   '⬡',
      virus:    '⬟',
      ice:      '◆',
      protocol: '⊕',
    };
    return symbols[this.card.type] || '?';
  }

  destroy(): void {
    this.element.remove();
  }
}
