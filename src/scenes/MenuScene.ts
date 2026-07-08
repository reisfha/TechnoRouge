import { CLASS_DEFINITIONS } from '../data/classes';
import './../styles/cards.css';
import './../styles/hud.css';
import './../styles/menus.css';

export class MenuScene {
  static show(onStart: (className: string) => void): void {
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
        <div class="menu-footer">[1-4] to select | WASD to explore | Mouse to aim</div>
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

      card.addEventListener('click', () => onStart(cls.id));
      grid.appendChild(card);
    });

    const keyHandler = (event: KeyboardEvent) => {
      const num = parseInt(event.key);
      if (num >= 1 && num <= CLASS_DEFINITIONS.length) {
        onStart(CLASS_DEFINITIONS[num - 1].id);
        window.removeEventListener('keydown', keyHandler);
      }
    };
    window.addEventListener('keydown', keyHandler);
  }
}
