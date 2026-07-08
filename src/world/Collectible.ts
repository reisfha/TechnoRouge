import * as THREE from 'three';

export interface CollectibleDef { position: THREE.Vector3; cardId: string }

const COLORS: Record<string, number> = {
  strike: 0xff4455, defend: 0x44ddff, inject: 0xff4455, barrier: 0x44ddff,
  overclock: 0xbb66ff, worm: 0x44ff66, turbo: 0xbb66ff, overload: 0xff8844,
  fortify: 0x44ddff, data_leak: 0x44ff66, recompile: 0xffdd44, neural_blitz: 0xff4455,
};

export class Collectible {
  mesh: THREE.Group;
  cardId: string;
  collected: boolean = false;
  private floatOffset: number;

  constructor(scene: THREE.Scene, def: CollectibleDef) {
    this.cardId = def.cardId;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.mesh = new THREE.Group();

    const color = COLORS[def.cardId] || 0x44ddff;
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.6, metalness: 0.7, roughness: 0.2, transparent: true, opacity: 0.9 })
    );
    this.mesh.add(crystal);

    const inner = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.2, 0),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
    );
    this.mesh.add(inner);

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 8, 8),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.15 })
    );
    this.mesh.add(glow);

    this.mesh.position.copy(def.position);
    this.mesh.position.y = 0.8;
    scene.add(this.mesh);
  }

  update(time: number): void {
    if (this.collected) return;
    this.mesh.position.y = 0.8 + Math.sin(time * 2 + this.floatOffset) * 0.2;
    this.mesh.rotation.y += 0.02;
  }

  checkCollection(playerPos: THREE.Vector3): boolean {
    if (this.collected) return false;
    if (this.mesh.position.distanceTo(playerPos) < 1.5) {
      this.collected = true;
      this.mesh.visible = false;
      return true;
    }
    return false;
  }

  destroy(): void { this.mesh.parent?.remove(this.mesh); }
}
