import * as THREE from 'three';

export class Terrain {
  private mesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    const size = 100;
    const divisions = 50;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#0a0a18';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#1a1a3a';
    ctx.lineWidth = 2;
    const step = 512 / divisions;
    for (let i = 0; i <= divisions; i++) {
      const pos = i * step;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(512, pos);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    const geometry = new THREE.PlaneGeometry(size, size);
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0x111122,
      metalness: 0.3,
      roughness: 0.8,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.position.y = -0.1;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }
}
