import * as THREE from 'three';

export interface EnemyEntityDef { position: THREE.Vector3; enemyId: string; name: string; patrolRadius: number; detectionRange: number }

export class EnemyEntity {
  mesh: THREE.Group;
  enemyId: string;
  name: string;
  detectionRange: number;
  alive: boolean = true;
  private origin: THREE.Vector3;
  private patrolRadius: number;
  private patrolAngle: number = Math.random() * Math.PI * 2;
  private patrolSpeed: number = 0.5 + Math.random() * 0.5;
  private floatOffset: number = Math.random() * Math.PI * 2;

  constructor(scene: THREE.Scene, def: EnemyEntityDef) {
    this.enemyId = def.enemyId;
    this.name = def.name;
    this.origin = def.position.clone();
    this.patrolRadius = def.patrolRadius;
    this.detectionRange = def.detectionRange;
    this.mesh = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.6, 0),
      new THREE.MeshStandardMaterial({ color: 0xff2255, emissive: 0xff2255, emissiveIntensity: 0.3, metalness: 0.5, roughness: 0.4, transparent: true, opacity: 0.9 })
    );
    this.mesh.add(body);

    const spikeMat = new THREE.MeshStandardMaterial({ color: 0xff4488, emissive: 0xff4488, emissiveIntensity: 0.2 });
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), spikeMat);
      spike.position.set(Math.cos(angle) * 0.6, 0, Math.sin(angle) * 0.6);
      spike.rotation.z = Math.PI / 2;
      spike.rotation.y = -angle;
      this.mesh.add(spike);
    }

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xff2255, transparent: true, opacity: 0.08 })
    );
    this.mesh.add(glow);

    this.mesh.position.copy(def.position);
    scene.add(this.mesh);
  }

  update(delta: number, time: number): void {
    if (!this.alive) return;
    this.patrolAngle += delta * this.patrolSpeed;
    const tx = this.origin.x + Math.cos(this.patrolAngle) * this.patrolRadius;
    const tz = this.origin.z + Math.sin(this.patrolAngle) * this.patrolRadius;
    this.mesh.position.x += (tx - this.mesh.position.x) * delta * 2;
    this.mesh.position.z += (tz - this.mesh.position.z) * delta * 2;
    this.mesh.position.y = 1 + Math.sin(time * 1.5 + this.floatOffset) * 0.15;
    this.mesh.rotation.y += delta * 0.5;
    this.mesh.rotation.x = Math.sin(time * 2) * 0.05;
  }

  checkDetection(playerPos: THREE.Vector3): boolean {
    return this.alive && this.mesh.position.distanceTo(playerPos) < this.detectionRange;
  }

  destroy(): void { this.mesh.parent?.remove(this.mesh); }
}
