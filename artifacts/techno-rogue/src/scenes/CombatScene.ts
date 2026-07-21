import Phaser from 'phaser';
import { Game } from '@workspace/game-logic';
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
  private damageFlash!: HTMLElement;
  private fromMap: boolean = false;
  private enemyType: 'combat' | 'elite' | 'boss' = 'combat';

  // Keep refs so we can remove them on shutdown
  private _onStateChanged!: () => void;
  private _onTurnChanged!: (_: any, data: any) => void;
  private _onGameOver!: (_: any, data: any) => void;
  private _onEnemyDamaged!: (_: any, data: any) => void;
  private _onPlayerHit!: () => void;

  constructor() {
    super({ key: 'CombatScene' });
  }

  init(data: { className?: string; enemyType?: string; fromMap?: boolean }): void {
    this.fromMap   = data.fromMap ?? false;
    this.enemyType = (data.enemyType as 'combat' | 'elite' | 'boss') ?? 'combat';
    if (data.className) {
      Game.startRun(data.className);
    }
    Game.spawnEnemies(this.enemyType);
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0a0a0f');
    this.drawBackground();
    this.setupUI();
    this.setupInput();
    this.setupListeners();

    this.time.delayedCall(200, () => {
      Game.startCombat();
      this.refreshUI();
    });
  }

  shutdown(): void {
    // Remove all Game listeners to prevent stale callbacks
    Game.off('state_changed',   this._onStateChanged);
    Game.off('turn_changed',    this._onTurnChanged);
    Game.off('game_over',       this._onGameOver);
    Game.off('enemy_damaged',   this._onEnemyDamaged);
    Game.off('player_hit',      this._onPlayerHit);
  }

  private drawBackground(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x0a0a1a, 0x12082a, 0x12082a, 1);
    bg.fillRect(0, 0, w, h);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a1a3a, 0.25);
    const gs = 44;
    for (let x = 0; x <= w; x += gs) { grid.moveTo(x, 0); grid.lineTo(x, h); }
    for (let y = 0; y <= h; y += gs) { grid.moveTo(0, y); grid.lineTo(w, y); }
    grid.strokePath();

    // Subtle glow particles
    const p = this.add.graphics();
    for (let i = 0; i < 25; i++) {
      p.fillStyle(0x44aaff, 0.15 + Math.random() * 0.25);
      p.fillCircle(Math.random() * w, Math.random() * h, 1 + Math.random() * 2);
    }
  }

  private setupUI(): void {
    const overlay = document.getElementById('ui-overlay') as HTMLElement;
    overlay.innerHTML = `
      <!-- Player area: bottom-left -->
      <div id="player-area">
        <div id="player-name-row" id="player-name-label"></div>
        <div id="hp-row">
          <span class="hp-icon">♥</span>
          <div class="bar-bg">
            <div class="bar-fill hp-fill" id="hp-fill"></div>
          </div>
          <span class="bar-text"><span id="hp-text">0</span>/<span id="max-hp-text">0</span></span>
        </div>
        <div id="block-row">
          <span class="block-icon">🛡</span>
          <span id="block-text">0</span>
        </div>
        <div id="player-effects"></div>
      </div>

      <!-- Energy: above player -->
      <div id="energy-display">
        <div id="energy-orbs"></div>
        <span id="energy-text">3/3</span>
      </div>

      <!-- Draw pile -->
      <div id="draw-pile-btn" title="Draw Pile">
        <div class="pile-icon">⊞</div>
        <span class="pile-count" id="deck-count-text">10</span>
        <div class="pile-label">DRAW</div>
      </div>

      <!-- Discard pile -->
      <div id="discard-pile-btn" title="Discard Pile">
        <div class="pile-icon">⊟</div>
        <span class="pile-count" id="discard-count-text">0</span>
        <div class="pile-label">DISC</div>
      </div>

      <!-- Enemies -->
      <div id="enemy-container"></div>

      <!-- Hand -->
      <div id="hand-container"></div>

      <!-- End turn: bottom-right -->
      <div id="end-turn-area">
        <button id="end-turn-btn" class="neon-btn">END TURN</button>
        <span class="end-turn-hint">[E]</span>
      </div>

      <!-- Phase flash -->
      <div id="phase-overlay" class="hidden">
        <div id="phase-text"></div>
      </div>

      <!-- Damage flash vignette -->
      <div id="damage-flash"></div>

      <!-- Game over -->
      <div id="game-over-overlay" class="hidden">
        <div class="game-over-box">
          <h1 id="result-title">DEFEATED</h1>
          <p id="result-subtitle">The system overwhelmed you.</p>
          <button id="restart-btn" class="neon-btn large">JACK IN AGAIN</button>
          <button id="menu-btn" class="neon-btn">MAIN MENU</button>
        </div>
      </div>
    `;

    this.handDisplay  = new HandDisplay('hand-container');
    this.playerHUD    = new PlayerHUD();
    this.enemyDisplay = new EnemyDisplay('enemy-container');

    this.enemyDisplay.setOnSelectEnemy((index) => Game.setTarget(index));

    this.endTurnBtn      = document.getElementById('end-turn-btn') as HTMLButtonElement;
    this.phaseOverlay    = document.getElementById('phase-overlay') as HTMLElement;
    this.gameOverOverlay = document.getElementById('game-over-overlay') as HTMLElement;
    this.resultTitle     = document.getElementById('result-title') as HTMLElement;
    this.resultSubtitle  = document.getElementById('result-subtitle') as HTMLElement;
    this.damageFlash     = document.getElementById('damage-flash') as HTMLElement;

    document.getElementById('restart-btn')!.addEventListener('click', () => this.restart());
    document.getElementById('menu-btn')!.addEventListener('click',    () => this.goToMenu());
  }

  private setupInput(): void {
    this.handDisplay.setOnPlayCard((index) => {
      if (Game.playCard(index)) this.refreshUI();
    });

    this.endTurnBtn.addEventListener('click', () => {
      if (Game.phase === 'player_turn') Game.endPlayerTurn();
    });

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (Game.phase !== 'player_turn') return;
      const key = event.key;
      if (key === 'e' || key === 'E') { Game.endPlayerTurn(); return; }
      const num = parseInt(key);
      if (num >= 1 && num <= 9 && Game.canPlayCard(num - 1)) {
        Game.playCard(num - 1);
        this.refreshUI();
      }
    });
  }

  private setupListeners(): void {
    this._onStateChanged = () => this.refreshUI();
    this._onTurnChanged  = (_: any, data: any) => this.showPhase(data.phase);
    this._onGameOver     = (_: any, data: any) => this.showGameOver(data.result);
    this._onEnemyDamaged = (_: any, data: any) => {
      // Spawn floating damage number near the enemy element
      const idx = Game.enemies.findIndex((e) => e === data.enemy);
      const el  = document.getElementById(`enemy-${data.enemy.def.id}-${idx}`);
      if (el && data.damage > 0) {
        const rect = el.getBoundingClientRect();
        const overlay = document.getElementById('ui-overlay')!;
        const oRect   = overlay.getBoundingClientRect();
        this.enemyDisplay.spawnFloatingNumber(
          data.damage,
          rect.left - oRect.left + rect.width / 2 - 15,
          rect.top  - oRect.top  + rect.height / 2 - 20,
          '#ff4455',
        );
      }
    };
    this._onPlayerHit = () => {
      this.damageFlash.classList.remove('flash');
      void this.damageFlash.offsetWidth;   // reflow to restart animation
      this.damageFlash.classList.add('flash');
    };

    Game.on('state_changed',  this._onStateChanged);
    Game.on('turn_changed',   this._onTurnChanged);
    Game.on('game_over',      this._onGameOver);
    Game.on('enemy_damaged',  this._onEnemyDamaged);
    Game.on('player_hit',     this._onPlayerHit);
  }

  private refreshUI(): void {
    if (!Game.player) return;

    this.playerHUD.update(Game.player);
    this.enemyDisplay.render(Game.enemies, Game.selectedTargetIndex);

    const isPlayerTurn = Game.phase === 'player_turn';
    this.handDisplay.render(Game.player.hand, (i) => Game.canPlayCard(i));

    this.endTurnBtn.disabled = !isPlayerTurn;
    this.endTurnBtn.classList.toggle('active', isPlayerTurn);
  }

  private showPhase(phase: string): void {
    if (phase === 'victory' || phase === 'defeat') return;

    const messages: Record<string, string> = {
      player_turn: 'YOUR TURN',
      enemy_turn:  'ENEMY TURN',
    };
    const msg = messages[phase];
    if (!msg) return;

    const textEl = document.getElementById('phase-text') as HTMLElement;
    textEl.textContent = msg;
    this.phaseOverlay.classList.remove('hidden');
    this.phaseOverlay.classList.add('visible');

    this.tweens.addCounter({
      from: 1, to: 0, duration: 700, delay: 500,
      onUpdate: (tw) => { textEl.style.opacity = String(tw.getValue()); },
      onComplete: () => {
        this.phaseOverlay.classList.add('hidden');
        this.phaseOverlay.classList.remove('visible');
        textEl.style.opacity = '1';
      },
    });
  }

  private showGameOver(result: string): void {
    // Short delay so the last state_changed render fires first
    this.time.delayedCall(120, () => {
      this.gameOverOverlay.classList.remove('hidden');
      this.gameOverOverlay.classList.add('visible');

      const restartBtn = document.getElementById('restart-btn') as HTMLElement;
      let continueBtn  = document.getElementById('continue-btn') as HTMLButtonElement | null;

      if (result === 'victory') {
        this.resultTitle.textContent   = 'SYSTEM BREACHED';
        this.resultSubtitle.textContent = 'You cracked the mainframe.';
        this.resultTitle.style.color   = '#44ff88';

        if (this.fromMap) {
          if (!continueBtn) {
            continueBtn = document.createElement('button');
            continueBtn.id        = 'continue-btn';
            continueBtn.className = 'neon-btn large active';
            continueBtn.textContent = 'CONTINUE';
            restartBtn.insertAdjacentElement('beforebegin', continueBtn);
          }
          continueBtn.style.display = '';
          continueBtn.onclick = () => {
            this.gameOverOverlay.classList.add('hidden');
            this.gameOverOverlay.classList.remove('visible');
            this.handDisplay.clear();
            this.scene.start('MapScene');
          };
          restartBtn.style.display = 'none';
        } else {
          if (continueBtn) continueBtn.style.display = 'none';
          restartBtn.style.display = '';
        }
      } else {
        this.resultTitle.textContent   = 'JACKED OUT';
        this.resultSubtitle.textContent = 'The system was too strong.';
        this.resultTitle.style.color   = '#ff4455';
        if (continueBtn) continueBtn.style.display = 'none';
        restartBtn.style.display = '';
      }
    });
  }

  private restart(): void {
    this.gameOverOverlay.classList.add('hidden');
    this.gameOverOverlay.classList.remove('visible');
    const className = Game.classDef?.id ?? 'netrunner';
    this.handDisplay.clear();
    // Restart in same mode (fromMap carries over)
    this.scene.restart({ className: !this.fromMap ? className : undefined, fromMap: this.fromMap, enemyType: this.enemyType });
  }

  private goToMenu(): void {
    this.gameOverOverlay.classList.add('hidden');
    this.gameOverOverlay.classList.remove('visible');
    this.handDisplay.clear();
    this.scene.start('MenuScene');
  }
}
