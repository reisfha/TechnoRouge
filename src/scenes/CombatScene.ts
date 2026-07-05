import Phaser from 'phaser';
import { Game } from '../Game';
import { HandDisplay } from '../ui/HandDisplay';
import { PlayerHUD } from '../ui/PlayerHUD';
import { EnemyDisplay } from '../ui/EnemyDisplay';

export class CombatScene extends Phaser.Scene {
  private handDisplay!: HandDisplay;
  private playerHUD!: PlayerHUD;
  private enemyDisplay!: EnemyDisplay;
  private endTurnBtn!: HTMLButtonElement;
  private phaseOverlay!: HTMLElement;
  private gameOverOverlay!: HTMLElement;
  private resultTitle!: HTMLElement;
  private resultSubtitle!: HTMLElement;
  private graphics!: Phaser.GameObjects.Graphics;
  private gridLines!: Phaser.GameObjects.Graphics;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: { className: string }): void {
    Game.startRun(data.className);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a0f');

    this.graphics = this.add.graphics();
    this.gridLines = this.add.graphics();
    this.drawBackground();

    this.setupUI();
    this.setupInput();
    this.setupListeners();

    this.time.delayedCall(300, () => {
      Game.startCombat();
      this.refreshUI();
    });
  }

  private drawBackground(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x1a0a2a, 0x1a0a2a, 1);
    bg.fillRect(0, 0, w, h);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3a, 0.3);

    const gridSize = 40;
    for (let x = 0; x <= w; x += gridSize) {
      grid.moveTo(x, 0);
      grid.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += gridSize) {
      grid.moveTo(0, y);
      grid.lineTo(w, y);
    }
    grid.strokePath();

    const particles = this.add.graphics();
    for (let i = 0; i < 30; i++) {
      const px = Math.random() * w;
      const py = Math.random() * h;
      const pr = 1 + Math.random() * 2;
      const alpha = 0.2 + Math.random() * 0.4;
      particles.fillStyle(0x44aaff, alpha);
      particles.fillCircle(px, py, pr);
    }
  }

  private setupUI(): void {
    const overlay = document.getElementById('ui-overlay') as HTMLElement;
    overlay.innerHTML = `
      <div id="player-hud">
        <div class="hud-group left">
          <div class="hud-item">
            <span class="hud-label">HP</span>
            <div class="bar-container">
              <div class="bar-bg">
                <div class="bar-fill hp-fill" id="hp-fill"></div>
              </div>
              <span class="bar-text"><span id="hp-text">0</span>/<span id="max-hp-text">0</span></span>
            </div>
          </div>
          <div class="hud-item" id="block-hud">
            <span class="hud-label">BLOCK</span>
            <span class="hud-value" id="block-text">0</span>
          </div>
        </div>
        <div class="hud-group right">
          <div class="hud-item">
            <span class="hud-label">ENERGY</span>
            <div class="energy-display">
              <div class="energy-orbs" id="energy-orbs"></div>
              <span class="hud-value energy-value" id="energy-text">3</span>
            </div>
          </div>
          <div class="hud-item small">
            <span class="hud-label">DECK</span>
            <span class="hud-value" id="deck-count-text">10</span>
          </div>
          <div class="hud-item small">
            <span class="hud-label">DISCARD</span>
            <span class="hud-value" id="discard-count-text">0</span>
          </div>
        </div>
      </div>

      <div id="enemy-container"></div>
      <div id="hand-container"></div>

      <div id="action-bar">
        <button id="end-turn-btn" class="neon-btn">END TURN [E]</button>
      </div>

      <div id="phase-overlay" class="hidden">
        <div id="phase-text"></div>
      </div>

      <div id="game-over-overlay" class="hidden">
        <div class="game-over-box">
          <h1 id="result-title">DEFEATED</h1>
          <p id="result-subtitle">The system overwhelmed you.</p>
          <button id="restart-btn" class="neon-btn large">JACK IN AGAIN</button>
          <button id="menu-btn" class="neon-btn">MAIN MENU</button>
        </div>
      </div>
    `;

    this.handDisplay = new HandDisplay('hand-container');
    this.playerHUD = new PlayerHUD();
    this.enemyDisplay = new EnemyDisplay('enemy-container');

    this.endTurnBtn = document.getElementById('end-turn-btn') as HTMLButtonElement;
    this.phaseOverlay = document.getElementById('phase-overlay') as HTMLElement;
    this.gameOverOverlay = document.getElementById('game-over-overlay') as HTMLElement;
    this.resultTitle = document.getElementById('result-title') as HTMLElement;
    this.resultSubtitle = document.getElementById('result-subtitle') as HTMLElement;

    const restartBtn = document.getElementById('restart-btn') as HTMLElement;
    const menuBtn = document.getElementById('menu-btn') as HTMLElement;

    restartBtn.addEventListener('click', () => this.restart());
    menuBtn.addEventListener('click', () => this.goToMenu());
  }

  private setupInput(): void {
    this.handDisplay.setOnPlayCard((index: number) => {
      Game.playCard(index);
      this.refreshUI();
    });

    this.endTurnBtn.addEventListener('click', () => {
      Game.endPlayerTurn();
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (Game.phase !== 'player_turn') return;

      const key = event.key;
      const num = parseInt(key);
      if (num >= 1 && num <= 9) {
        const index = num - 1;
        if (Game.canPlayCard(index)) {
          Game.playCard(index);
          this.refreshUI();
        }
      }

      if (key === 'e' || key === 'E') {
        Game.endPlayerTurn();
      }
    });
  }

  private setupListeners(): void {
    Game.on('state_changed', () => this.refreshUI());
    Game.on('turn_changed', (_, data) => {
      this.showPhase(data.phase);
    });
    Game.on('game_over', (_, data) => {
      this.showGameOver(data.result);
    });
  }

  private refreshUI(): void {
    if (!Game.player) return;

    this.playerHUD.update(Game.player);

    this.enemyDisplay.render(Game.enemies);

    const isPlayerTurn = Game.phase === 'player_turn';
    this.handDisplay.render(Game.player.hand, (i: number) => Game.canPlayCard(i));

    this.endTurnBtn.disabled = !isPlayerTurn;
    this.endTurnBtn.classList.toggle('active', isPlayerTurn);
  }

  private showPhase(phase: string): void {
    if (phase === 'victory' || phase === 'defeat') return;

    const messages: Record<string, string> = {
      player_turn: 'YOUR TURN',
      enemy_turn: 'ENEMY TURN',
    };

    const msg = messages[phase];
    if (!msg) return;

    const textEl = document.getElementById('phase-text') as HTMLElement;
    textEl.textContent = msg;
    this.phaseOverlay.classList.remove('hidden');
    this.phaseOverlay.classList.add('visible');

    this.tweens.addCounter({
      from: 1,
      to: 0,
      duration: 800,
      delay: 600,
      ease: 'Power2',
      onUpdate: (tween) => {
        textEl.style.opacity = String(tween.getValue());
      },
      onComplete: () => {
        this.phaseOverlay.classList.add('hidden');
        this.phaseOverlay.classList.remove('visible');
        textEl.style.opacity = '1';
      },
    });
  }

  private showGameOver(result: string): void {
    this.gameOverOverlay.classList.remove('hidden');
    this.gameOverOverlay.classList.add('visible');

    if (result === 'victory') {
      this.resultTitle.textContent = 'SYSTEM BREACHED';
      this.resultSubtitle.textContent = 'You cracked the mainframe.';
      this.resultTitle.style.color = '#44ff66';
    } else {
      this.resultTitle.textContent = 'JACKED OUT';
      this.resultSubtitle.textContent = 'The system was too strong.';
      this.resultTitle.style.color = '#ff4455';
    }
  }

  private restart(): void {
    this.gameOverOverlay.classList.remove('visible');
    this.gameOverOverlay.classList.add('hidden');
    const className = Game.classDef?.id ?? 'netrunner';
    this.handDisplay.clear();
    this.scene.restart({ className });
  }

  private goToMenu(): void {
    this.gameOverOverlay.classList.remove('visible');
    this.gameOverOverlay.classList.add('hidden');
    this.handDisplay.clear();
    this.scene.start('MenuScene');
  }
}
