import * as THREE from 'three';
import { Terrain } from '../world/Terrain';
import { Scenery } from '../world/Scenery';
import { PlayerController } from '../world/PlayerController';
import { CameraController } from '../world/CameraController';
import { Collectible, CollectibleDef } from '../world/Collectible';
import { EnemyEntity, EnemyEntityDef } from '../world/EnemyEntity';

const CARD_SPAWNS: CollectibleDef[] = [
  { position: new THREE.Vector3(5, 0, -3), cardId: 'inject' },
  { position: new THREE.Vector3(-4, 0, 6), cardId: 'barrier' },
  { position: new THREE.Vector3(8, 0, 8), cardId: 'turbo' },
  { position: new THREE.Vector3(-8, 0, -5), cardId: 'worm' },
  { position: new THREE.Vector3(0, 0, -12), cardId: 'overload' },
  { position: new THREE.Vector3(14, 0, -6), cardId: 'fortify' },
  { position: new THREE.Vector3(-12, 0, 10), cardId: 'data_leak' },
  { position: new THREE.Vector3(-16, 0, -10), cardId: 'recompile' },
  { position: new THREE.Vector3(18, 0, 12), cardId: 'neural_blitz' },
];

const ENEMY_SPAWNS: EnemyEntityDef[] = [
  { position: new THREE.Vector3(6, 0, -5), enemyId: 'patrol_ice', name: 'Patrol ICE', patrolRadius: 2, detectionRange: 3 },
  { position: new THREE.Vector3(-6, 0, 8), enemyId: 'firewall_daemon', name: 'Firewall Daemon', patrolRadius: 2.5, detectionRange: 3.5 },
  { position: new THREE.Vector3(10, 0, 10), enemyId: 'corrupted_node', name: 'Corrupted Node', patrolRadius: 3, detectionRange: 3 },
  { position: new THREE.Vector3(-10, 0, -8), enemyId: 'data_vampire', name: 'Data Vampire', patrolRadius: 2, detectionRange: 3.5 },
  { position: new THREE.Vector3(0, 0, -15), enemyId: 'system_guardian', name: 'System Guardian', patrolRadius: 2, detectionRange: 4 },
];

export class WorldScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private terrain!: Terrain;
  private scenery!: Scenery;
  private player!: PlayerController;
  private cameraController!: CameraController;
  private collectibles: Collectible[] = [];
  private enemyEntities: EnemyEntity[] = [];
  private time: number = 0;
  private paused: boolean = false;
  private notificationEl: HTMLElement | null = null;

  onCombatTrigger?: (enemyDef: string) => void;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
    this.scene = scene;
    this.camera = camera;
  }

  init(): void {
    this.scene.background = new THREE.Color(0x050510);

    this.scene.add(new THREE.AmbientLight(0x222244, 0.4));
    const dir = new THREE.DirectionalLight(0x4444ff, 0.5);
    dir.position.set(10, 20, 10);
    this.scene.add(dir);

    const p1 = new THREE.PointLight(0xff44aa, 0.3, 30);
    p1.position.set(-10, 5, -10);
    this.scene.add(p1);
    const p2 = new THREE.PointLight(0x44ffaa, 0.3, 30);
    p2.position.set(10, 5, 10);
    this.scene.add(p2);

    this.terrain = new Terrain(this.scene);
    this.scenery = new Scenery(this.scene);

    this.player = new PlayerController(this.scene, new THREE.Vector3(0, 0, 0));
    this.cameraController = new CameraController(this.camera, () => this.player.getPosition());
    this.player.setAimPoint(this.cameraController.aimPoint);

    for (const def of CARD_SPAWNS) this.collectibles.push(new Collectible(this.scene, def));
    for (const def of ENEMY_SPAWNS) this.enemyEntities.push(new EnemyEntity(this.scene, def));
    this.createStars();
    this.createHUD();
  }

  private createStars(): void {
    const positions = new Float32Array(6000);
    for (let i = 0; i < 6000; i++) positions[i] = (Math.random() - 0.5) * 400;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x446688, size: 0.2, transparent: true, opacity: 0.6 }));
    stars.position.y = 30;
    this.scene.add(stars);
  }

  private createHUD(): void {
    const crosshair = document.createElement('div');
    crosshair.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;pointer-events:none;z-index:15';
    crosshair.innerHTML = '<svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="2" fill="none" stroke="#44ddff" stroke-width="1" opacity="0.7"/>' +
      '<line x1="10" y1="0" x2="10" y2="6" stroke="#44ddff" stroke-width="1" opacity="0.4"/>' +
      '<line x1="10" y1="14" x2="10" y2="20" stroke="#44ddff" stroke-width="1" opacity="0.4"/>' +
      '<line x1="0" y1="10" x2="6" y2="10" stroke="#44ddff" stroke-width="1" opacity="0.4"/>' +
      '<line x1="14" y1="10" x2="20" y2="10" stroke="#44ddff" stroke-width="1" opacity="0.4"/></svg>';
    document.getElementById('ui-overlay')!.appendChild(crosshair);

    this.notificationEl = document.createElement('div');
    this.notificationEl.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:Courier New,monospace;color:#44ddff;font-size:18px;text-shadow:0 0 10px #44ddff80;pointer-events:none;opacity:0;transition:opacity .3s;z-index:20;text-align:center';
    document.getElementById('ui-overlay')!.appendChild(this.notificationEl);

    const help = document.createElement('div');
    help.style.cssText = 'position:absolute;top:10px;left:50%;transform:translateX(-50%);font-family:Courier New,monospace;color:#444;font-size:11px;z-index:20;pointer-events:none;text-align:center';
    help.textContent = 'WASD MOVE | MOUSE = AIM + LOOK | APPROACH ENEMIES TO FIGHT | COLLECT DATA CRYSTALS';
    document.getElementById('ui-overlay')!.appendChild(help);
  }

  update(delta: number): void {
    if (this.paused) return;
    this.time += delta;

    this.cameraController.update(delta);
    this.player.setAimPoint(this.cameraController.aimPoint);
    this.player.update(delta);

    const playerPos = this.player.getPosition();
    for (const c of this.collectibles) {
      c.update(this.time);
      if (c.checkCollection(playerPos)) this.showNotification(`ACQUIRED: ${c.cardId.toUpperCase()}`);
    }

    for (const e of this.enemyEntities) {
      e.update(delta, this.time);
      if (e.checkDetection(playerPos)) {
        this.showNotification(`COMBAT: ${e.name}`);
        this.paused = true;
        setTimeout(() => this.onCombatTrigger?.(e.enemyId), 500);
      }
    }
  }

  private showNotification(msg: string): void {
    if (!this.notificationEl) return;
    this.notificationEl.textContent = msg;
    this.notificationEl.style.opacity = '1';
    setTimeout(() => { if (this.notificationEl) this.notificationEl.style.opacity = '0'; }, 1500);
  }

  pause(): void { this.paused = true; }
  resume(): void { this.paused = false; }

  destroy(): void {
    this.player.destroy();
    this.cameraController.destroy();
    for (const c of this.collectibles) c.destroy();
    for (const e of this.enemyEntities) e.destroy();
    const overlay = document.getElementById('ui-overlay');
    if (overlay) overlay.innerHTML = '';
  }
}
