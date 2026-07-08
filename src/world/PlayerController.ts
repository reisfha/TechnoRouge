import * as THREE from 'three';

export class PlayerController {
  mesh: THREE.Group;
  position: THREE.Vector3;
  speed: number = 8;
  private keys: Set<string> = new Set();
  private aimPoint: THREE.Vector3;

  constructor(scene: THREE.Scene, startPos: THREE.Vector3) {
    this.position = startPos.clone();
    this.aimPoint = new THREE.Vector3(0, 0, -5);
    this.mesh = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x44ddff, emissive: 0x44ddff, emissiveIntensity: 0.1, metalness: 0.6, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.2, 8), bodyMat);
    body.position.y = 0.6;
    this.mesh.add(body);

    const headMat = new THREE.MeshStandardMaterial({ color: 0x88eeff, emissive: 0x44ddff, emissiveIntensity: 0.15 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), headMat);
    head.position.y = 1.4;
    this.mesh.add(head);

    const glowMat = new THREE.MeshBasicMaterial({ color: 0x44ddff, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.6, 16), glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.05;
    this.mesh.add(glow);

    this.mesh.position.copy(this.position);
    scene.add(this.mesh);

    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()));
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()));
  }

  setAimPoint(point: THREE.Vector3): void {
    this.aimPoint.copy(point);
  }

  update(delta: number): void {
    const toTarget = new THREE.Vector3(
      this.aimPoint.x - this.position.x, 0, this.aimPoint.z - this.position.z
    );
    if (toTarget.length() > 0.01) {
      toTarget.normalize();
      const targetAngle = Math.atan2(toTarget.x, toTarget.z);
      let diff = targetAngle - this.mesh.rotation.y;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.mesh.rotation.y += diff * 0.15;
    }

    const move = new THREE.Vector3(0, 0, 0);
    if (this.keys.has('w')) move.z -= 1;
    if (this.keys.has('s')) move.z += 1;
    if (this.keys.has('a')) move.x -= 1;
    if (this.keys.has('d')) move.x += 1;

    if (move.length() > 0) {
      move.normalize();
      const facing = this.mesh.rotation.y;
      const rotated = new THREE.Vector3(
        move.x * Math.cos(facing) - move.z * Math.sin(facing), 0,
        move.x * Math.sin(facing) + move.z * Math.cos(facing)
      );
      this.position.x += rotated.x * this.speed * delta;
      this.position.z += rotated.z * this.speed * delta;
      const worldSize = 40;
      this.position.x = Math.max(-worldSize, Math.min(worldSize, this.position.x));
      this.position.z = Math.max(-worldSize, Math.min(worldSize, this.position.z));
      this.mesh.position.copy(this.position);
    }
  }

  getPosition(): THREE.Vector3 { return this.position; }

  destroy(): void {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
