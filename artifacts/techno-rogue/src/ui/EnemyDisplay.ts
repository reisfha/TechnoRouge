import { Enemy } from '@workspace/game-logic';

const INTENT_DATA: Record<string, { icon: string; label: string; color: string }> = {
  attack: { icon: '⚔',  label: 'ATTACK',  color: '#ff4455' },
  defend: { icon: '🛡',  label: 'DEFEND',  color: '#44ddff' },
  buff:   { icon: '⬆',  label: 'BUFF',    color: '#bb66ff' },
  debuff: { icon: '⬇',  label: 'DEBUFF',  color: '#ff8844' },
  status: { icon: '☣',  label: 'STATUS',  color: '#44ff88' },
};

const EFFECT_COLORS: Record<string, string> = {
  poison:     '#44ff88',
  weak:       '#ffaa44',
  vulnerable: '#ff6644',
  strength:   '#ff4488',
  fortify:    '#44ddff',
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
      if (index === selectedIndex && enemy.isAlive) el.classList.add('selected');
      if (!enemy.isAlive) el.classList.add('dead');
      el.id = `enemy-${enemy.def.id}-${index}`;

      const hpPct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

      // Intent
      let intentHtml = '';
      if (enemy.currentIntent) {
        const intent = enemy.currentIntent;
        const data = INTENT_DATA[intent.type] || { icon: '?', label: intent.type.toUpperCase(), color: '#aaa' };
        let valueHtml = '';
        if (intent.type === 'attack' && intent.value) {
          const dmg = intent.value + enemy.strength;
          valueHtml = `<span class="intent-damage">${dmg}</span>`;
        } else if ((intent.type === 'defend') && intent.value) {
          valueHtml = `<span class="intent-block-val">${intent.value}</span>`;
        } else if (intent.effectValue) {
          valueHtml = `<span class="intent-effect-val">${intent.effectValue}</span>`;
        }
        intentHtml = `
          <div class="enemy-intent" style="--intent-color:${data.color}">
            <span class="intent-icon">${data.icon}</span>
            <span class="intent-label">${data.label}</span>
            ${valueHtml}
          </div>`;
      } else {
        intentHtml = `<div class="enemy-intent intent-unknown"><span class="intent-icon">?</span></div>`;
      }

      // Effects
      const effectsHtml = enemy.effects.map((e) => {
        const color = EFFECT_COLORS[e.name] || '#aaa';
        return `<span class="effect-badge" style="--eff-color:${color}" title="${e.name}">${e.name.slice(0,3).toUpperCase()} ${e.stacks}</span>`;
      }).join('');

      // Block badge
      const blockHtml = enemy.block > 0
        ? `<div class="enemy-block-badge">🛡 ${enemy.block}</div>`
        : '';

      el.innerHTML = `
        <div class="enemy-name">${enemy.name}</div>
        ${intentHtml}
        <div class="enemy-sprite-wrap">
          <div class="enemy-sprite" style="--enemy-color:#ff4466">
            <div class="enemy-sprite-glow"></div>
            <div class="enemy-sprite-body"></div>
            <div class="enemy-sprite-eye"></div>
          </div>
          ${blockHtml}
        </div>
        <div class="enemy-hp-wrap">
          <div class="bar-bg">
            <div class="bar-fill enemy-hp-fill" style="width:${hpPct}%"></div>
          </div>
          <span class="bar-text">${enemy.hp} / ${enemy.maxHp}</span>
        </div>
        ${effectsHtml.length ? `<div class="enemy-effects">${effectsHtml}</div>` : ''}
      `;

      el.addEventListener('click', () => {
        if (enemy.isAlive && this.onSelectEnemy) this.onSelectEnemy(index);
      });

      this.container.appendChild(el);
    });
  }

  /** Show a floating number at (x, y) in screen coords, red=damage, blue=block */
  spawnFloatingNumber(value: number, x: number, y: number, color = '#ff4455'): void {
    const el = document.createElement('div');
    el.className = 'float-number';
    el.textContent = `-${value}`;
    el.style.cssText = `left:${x}px; top:${y}px; color:${color};`;
    document.getElementById('ui-overlay')?.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  clear(): void {
    this.container.innerHTML = '';
  }
}
