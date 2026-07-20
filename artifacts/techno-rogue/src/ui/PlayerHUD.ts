import { Player } from '../entities/Player';

export class PlayerHUD {
  private hpFill: HTMLElement;
  private hpText: HTMLElement;
  private maxHpText: HTMLElement;
  private blockText: HTMLElement;
  private blockHud: HTMLElement;
  private energyText: HTMLElement;
  private energyOrbs: HTMLElement;
  private deckCountText: HTMLElement;
  private discardCountText: HTMLElement;

  constructor() {
    this.hpFill = document.getElementById('hp-fill') as HTMLElement;
    this.hpText = document.getElementById('hp-text') as HTMLElement;
    this.maxHpText = document.getElementById('max-hp-text') as HTMLElement;
    this.blockText = document.getElementById('block-text') as HTMLElement;
    this.blockHud = document.getElementById('block-hud') as HTMLElement;
    this.energyText = document.getElementById('energy-text') as HTMLElement;
    this.energyOrbs = document.getElementById('energy-orbs') as HTMLElement;
    this.deckCountText = document.getElementById('deck-count-text') as HTMLElement;
    this.discardCountText = document.getElementById('discard-count-text') as HTMLElement;
  }

  update(player: Player): void {
    const hpPercent = (player.hp / player.maxHp) * 100;
    this.hpFill.style.width = `${hpPercent}%`;
    this.hpText.textContent = String(player.hp);
    this.maxHpText.textContent = String(player.maxHp);

    if (player.block > 0) {
      this.blockHud.classList.add('active');
    } else {
      this.blockHud.classList.remove('active');
    }
    this.blockText.textContent = String(player.block);

    this.energyText.textContent = String(player.energy);
    this.renderEnergyOrbs(player.energy, player.maxEnergy);

    this.deckCountText.textContent = String(player.drawPile.length);
    this.discardCountText.textContent = String(player.discardPile.length);
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
