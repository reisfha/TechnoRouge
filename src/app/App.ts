import { Game } from '../Game';
import { WorldScene } from './WorldScene';
import { CombatScene } from './CombatScene';
import type { WebGLRenderer, Scene, PerspectiveCamera } from 'three';
import { Clock, Color } from 'three';

export type AppState = 'menu' | 'world' | 'combat' | 'game_over';

export class App {
  private currentState: AppState = 'menu';
  private worldScene: WorldScene | null = null;
  private combatScene: CombatScene | null = null;
  private clock: Clock;
  private animFrameId: number = 0;
  private running: boolean = false;

  constructor(
    private renderer: WebGLRenderer,
    private scene: Scene,
    private camera: PerspectiveCamera
  ) {
    this.clock = new Clock();
  }

  async start(): Promise<void> {
    this.running = true;
    this.showMenu();
    this.loop();
  }

  private loop(): void {
    if (!this.running) return;
    this.animFrameId = requestAnimationFrame(() => this.loop());
    const delta = this.clock.getDelta();

    if (this.currentState === 'world' && this.worldScene) {
      this.worldScene.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  showMenu(): void {
    this.cleanupWorld();
    this.cleanupCombat();
    this.currentState = 'menu';
    this.scene.background = new Color(0x0a0a0f);

    import('../scenes/MenuScene').then(({ MenuScene }) => {
      MenuScene.show((className: string) => this.startWorld(className));
    });
  }

  startWorld(className: string): void {
    Game.startRun(className);
    this.cleanupWorld();
    this.currentState = 'world';

    this.worldScene = new WorldScene(this.scene, this.camera);
    this.worldScene.init();
    this.worldScene.onCombatTrigger = (enemyDef: string) => {
      this.startCombat(enemyDef);
    };
  }

  startCombat(enemyDef: string): void {
    this.currentState = 'combat';
    if (this.worldScene) {
      this.worldScene.pause();
    }

    Game.spawnSingleEnemy(enemyDef);
    this.combatScene = new CombatScene();
    this.combatScene.init(() => {
      this.returnToWorld();
    }, () => {
      this.showMenu();
    });
  }

  private returnToWorld(): void {
    this.cleanupCombat();
    if (this.worldScene) {
      this.worldScene.resume();
    }
    if (Game.phase === 'defeat' || Game.phase === 'victory') {
      this.showMenu();
      return;
    }
    this.currentState = 'world';
  }

  private cleanupWorld(): void {
    if (this.worldScene) {
      this.worldScene.destroy();
      this.worldScene = null;
    }
  }

  private cleanupCombat(): void {
    if (this.combatScene) {
      this.combatScene.destroy();
      this.combatScene = null;
    }
  }

  destroy(): void {
    this.running = false;
    cancelAnimationFrame(this.animFrameId);
    this.cleanupWorld();
    this.cleanupCombat();
  }
}
