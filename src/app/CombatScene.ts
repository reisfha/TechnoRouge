import { Game } from '../Game';
import { HandDisplay } from '../ui/HandDisplay';
import { PlayerHUD } from '../ui/PlayerHUD';
import { EnemyDisplay } from '../ui/EnemyDisplay';

export class CombatScene {
  private handDisplay!: HandDisplay;
  private playerHUD!: PlayerHUD;
  private enemyDisplay!: EnemyDisplay;
  private endTurnBtn!: HTMLButtonElement;
  private phaseOverlay!: HTMLElement;
  private gameOverOverlay!: HTMLElement;
  private resultTitle!: HTMLElement;
  private resultSubtitle!: HTMLElement;
  private onReturnToWorld: () => void = () => {};
  private onGoToMenu: () => void = () => {};
  private cleanupFns: (() => void)[] = [];
  private stateChangedUnsub: (() => void) | null = null;
  private gameOverUnsub: (() => void) | null = null;

  init(onReturn: () => void, onMenu: () => void): void {
    this.onReturnToWorld = onReturn;
    this.onGoToMenu = onMenu;

    const overlay = document.getElementById('ui-overlay')!;
    overlay.innerHTML = `
      <div id="player-hud">
        <div class="hud-group left">
          <div class="hud-item">
            <span class="hud-label">HP</span>
            <div class="bar-container">
              <div class="bar-bg"><div class="bar-fill hp-fill" id="hp-fill"></div></div>
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
          <div class="hud-item small"><span class="hud-label">DECK</span><span class="hud-value" id="deck-count-text">10</span></div>
          <div class="hud-item small"><span class="hud-label">DISCARD</span><span class="hud-value" id="discard-count-text">0</span></div>
        </div>
      </div>
      <div id="enemy-container"></div>
      <div id="hand-container"></div>
      <div id="action-bar"><button id="end-turn-btn" class="neon-btn">END TURN [E]</button></div>
      <div id="phase-overlay" class="hidden"><div id="phase-text"></div></div>
      <div id="game-over-overlay" class="hidden">
        <div class="game-over-box">
          <h1 id="result-title">DEFEATED</h1>
          <p id="result-subtitle">The system overwhelmed you.</p>
          <button id="return-btn" class="neon-btn large">RETURN</button>
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

    document.getElementById('return-btn')!.addEventListener('click', () => this.onReturnToWorld());
    document.getElementById('menu-btn')!.addEventListener('click', () => this.onGoToMenu());

    this.setupInput();
    this.stateChangedUnsub = this.onEvent('state_changed', () => this.refreshUI());
    this.gameOverUnsub = this.onEvent('game_over', (_, data) => this.showGameOver(data.result));

    setTimeout(() => { Game.startCombat(); this.refreshUI(); }, 100);
  }

  private onEvent(event: string, cb: (e: string, d?: any) => void): () => void {
    const handler = (e: string, d?: any) => { if (e === event) cb(e, d); };
    Game.on(event as any, handler);
    return () => Game.off(event as any, handler);
  }

  private setupInput(): void {
    this.handDisplay.setOnPlayCard((i: number) => { Game.playCard(i); this.refreshUI(); });
    this.endTurnBtn.addEventListener('click', () => Game.endPlayerTurn());
    const keyHandler = (e: KeyboardEvent) => {
      if (Game.phase !== 'player_turn') return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 9 && Game.canPlayCard(n - 1)) { Game.playCard(n - 1); this.refreshUI(); }
      if (e.key === 'e' || e.key === 'E') Game.endPlayerTurn();
    };
    window.addEventListener('keydown', keyHandler);
    this.cleanupFns.push(() => window.removeEventListener('keydown', keyHandler));
  }

  private refreshUI(): void {
    if (!Game.player) return;
    this.playerHUD.update(Game.player);
    this.enemyDisplay.render(Game.enemies);
    const isPlayer = Game.phase === 'player_turn';
    this.handDisplay.render(Game.player.hand, (i: number) => Game.canPlayCard(i));
    this.endTurnBtn.disabled = !isPlayer;
    this.endTurnBtn.classList.toggle('active', isPlayer);
  }

  private showGameOver(result: string): void {
    this.gameOverOverlay.classList.remove('hidden');
    this.gameOverOverlay.classList.add('visible');
    if (result === 'victory') {
      this.resultTitle.textContent = 'ENEMY DEFEATED';
      this.resultSubtitle.textContent = 'Return to the world.';
      this.resultTitle.style.color = '#44ff66';
    } else {
      this.resultTitle.textContent = 'JACKED OUT';
      this.resultSubtitle.textContent = 'The system was too strong.';
      this.resultTitle.style.color = '#ff4455';
    }
  }

  destroy(): void {
    this.cleanupFns.forEach((fn) => fn());
    if (this.stateChangedUnsub) this.stateChangedUnsub();
    if (this.gameOverUnsub) this.gameOverUnsub();
    document.getElementById('ui-overlay')!.innerHTML = '';
  }
}
