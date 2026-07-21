import Phaser from 'phaser';
import { CLASS_DEFINITIONS } from '@workspace/game-logic';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a0f');

    const overlay = document.getElementById('ui-overlay') as HTMLElement;
    overlay.innerHTML = `
      <div class="menu-container">
        <div class="menu-title">
          <h1 class="game-title">TECHNOROUGE</h1>
          <p class="game-subtitle">JACK INTO THE SYSTEM</p>
        </div>
        <div class="class-select">
          <h2 class="select-title">SELECT ARCHETYPE</h2>
          <div class="class-grid" id="class-grid"></div>
        </div>
        <div class="menu-footer">[1-4] to select | Keyboard + Touch</div>
      </div>
    `;

    const grid = document.getElementById('class-grid') as HTMLElement;

    CLASS_DEFINITIONS.forEach((cls, index) => {
      const card = document.createElement('div');
      card.className = 'class-card';
      card.style.setProperty('--class-color', cls.color);
      card.dataset.index = String(index);

      card.innerHTML = `
        <div class="class-number">${index + 1}</div>
        <div class="class-name">${cls.name.toUpperCase()}</div>
        <div class="class-hp">HP ${cls.maxHp}</div>
        <div class="class-energy">ENERGY ${cls.maxEnergy}</div>
        <div class="class-desc">${cls.description}</div>
        <div class="class-deck-preview">${cls.starterDeck.length} cards</div>
      `;

      card.addEventListener('click', () => this.startGame(cls.id));
      card.addEventListener('mouseenter', () => {
        card.classList.add('hovered');
      });
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
      });

      grid.appendChild(card);
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      const num = parseInt(event.key);
      if (num >= 1 && num <= CLASS_DEFINITIONS.length) {
        this.startGame(CLASS_DEFINITIONS[num - 1].id);
      }
    });
  }

  private startGame(className: string): void {
    const overlay = document.getElementById('ui-overlay') as HTMLElement;
    overlay.innerHTML = '';

    this.scene.start('MapScene', { className });
  }
}
