import { Enemy } from '../entities/Enemy';

const INTENT_LABELS: Record<string, string> = {
  attack: 'ATTACK',
  defend: 'DEFEND',
  buff: 'BUFF',
  debuff: 'DEBUFF',
  status: 'STATUS',
};

const INTENT_ICONS: Record<string, string> = {
  attack: '[X]',
  defend: '[~]',
  buff: '[+]',
  debuff: '[-]',
  status: '[!]',
};

export class EnemyDisplay {
  private container: HTMLElement;
  private onSelectEnemy: ((index: number) => void) | null = null;

  constructor(containerId: string = 'enemy-container') {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  setOnSelectEnemy(cb: (index: number) => void): void {
    this.onSelectEnemy = cb;
  }

  render(enemies: Enemy[], selectedIndex: number = 0): void {
    this.container.innerHTML = '';

    enemies.forEach((enemy, index) => {
      const el = document.createElement('div');
      el.className = 'enemy-card';
      if (index === selectedIndex && enemy.isAlive) {
        el.classList.add('selected');
      }
      if (!enemy.isAlive) {
        el.classList.add('dead');
      }
      el.id = `enemy-${enemy.def.id}`;

      const hpPercent = (enemy.hp / enemy.maxHp) * 100;

      const effectsHtml = enemy.effects
        .map(
          (e) =>
            `<span class="effect-badge ${e.type}">${e.name} ${e.stacks}</span>`
        )
        .join('');

      let intentHtml = '';
      if (enemy.currentIntent) {
        const intent = enemy.currentIntent;
        const label = INTENT_LABELS[intent.type] || intent.type.toUpperCase();
        const icon = INTENT_ICONS[intent.type] || '[?]';
        const val = intent.value || intent.effectValue || '';
        intentHtml = `
          <div class="enemy-intent">
            <span class="intent-icon">${icon}</span>
            <span class="intent-label">${label}</span>
            <span class="intent-value">${val}</span>
          </div>
        `;
      }

      el.innerHTML = `
        <div class="enemy-name">${enemy.name}</div>
        ${intentHtml}
        <div class="enemy-sprite">
          <div class="sprite-placeholder" style="border-color: var(--enemy-color, #ff4466)"></div>
        </div>
        <div class="enemy-hp-bar">
          <div class="bar-bg">
            <div class="bar-fill enemy-hp-fill" style="width:${hpPercent}%"></div>
          </div>
          <span class="bar-text">${enemy.hp}/${enemy.maxHp}</span>
        </div>
        ${enemy.block > 0 ? `<div class="enemy-block">BLOCK ${enemy.block}</div>` : ''}
        <div class="enemy-effects">${effectsHtml}</div>
      `;

      el.addEventListener('click', () => {
        if (enemy.isAlive && this.onSelectEnemy) {
          this.onSelectEnemy(index);
        }
      });

      this.container.appendChild(el);
    });
  }

  clear(): void {
    this.container.innerHTML = '';
  }
}
