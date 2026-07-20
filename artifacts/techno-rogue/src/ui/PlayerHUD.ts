import { Player } from '../entities/Player';

const EFFECT_COLORS: Record<string, string> = {
  poison:     '#44ff88',
  weak:       '#ffaa44',
  vulnerable: '#ff6644',
  strength:   '#ff4488',
  fortify:    '#44ddff',
};

const EFFECT_ICONS: Record<string, string> = {
  poison:     '☣',
  weak:       '⬇',
  vulnerable: '💔',
  strength:   '⬆',
  fortify:    '🛡',
};

export class PlayerHUD {
  private hpFill!: HTMLElement;
  private hpText!: HTMLElement;
  private maxHpText!: HTMLElement;
  private blockRow!: HTMLElement;
  private blockText!: HTMLElement;
  private energyText!: HTMLElement;
  private energyOrbs!: HTMLElement;
  private deckCountText!: HTMLElement;
  private discardCountText!: HTMLElement;
  private playerEffects!: HTMLElement;

  bind(): void {
    this.hpFill         = document.getElementById('hp-fill')!;
    this.hpText         = document.getElementById('hp-text')!;
    this.maxHpText      = document.getElementById('max-hp-text')!;
    this.blockRow       = document.getElementById('block-row')!;
    this.blockText      = document.getElementById('block-text')!;
    this.energyText     = document.getElementById('energy-text')!;
    this.energyOrbs     = document.getElementById('energy-orbs')!;
    this.deckCountText  = document.getElementById('deck-count-text')!;
    this.discardCountText = document.getElementById('discard-count-text')!;
    this.playerEffects  = document.getElementById('player-effects')!;
  }

  update(player: Player): void {
    if (!this.hpFill) this.bind();

    const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
    this.hpFill.style.width = `${hpPct}%`;
    this.hpText.textContent = String(player.hp);
    this.maxHpText.textContent = String(player.maxHp);

    if (player.block > 0) {
      this.blockRow.classList.add('active');
      this.blockText.textContent = String(player.block);
    } else {
      this.blockRow.classList.remove('active');
    }

    this.energyText.textContent = `${player.energy}/${player.maxEnergy}`;
    this.renderEnergyOrbs(player.energy, player.maxEnergy);

    this.deckCountText.textContent    = String(player.drawPile.length);
    this.discardCountText.textContent = String(player.discardPile.length);

    // Effects
    this.playerEffects.innerHTML = player.effects.map((e) => {
      const color = EFFECT_COLORS[e.name] || '#aaa';
      const icon  = EFFECT_ICONS[e.name]  || '?';
      return `<span class="player-effect-badge" style="--eff-color:${color}" title="${e.name} ${e.stacks} (${e.turnsRemaining} turns)">
        ${icon}<span class="eff-stacks">${e.stacks}</span>
      </span>`;
    }).join('');
  }

  private renderEnergyOrbs(current: number, max: number): void {
    this.energyOrbs.innerHTML = '';
    for (let i = 0; i < max; i++) {
      const orb = document.createElement('div');
      orb.className = 'energy-orb' + (i >= current ? ' spent' : '');
      this.energyOrbs.appendChild(orb);
    }
  }
}
