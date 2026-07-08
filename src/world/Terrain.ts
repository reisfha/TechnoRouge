import * as THREE from 'three';

export class Terrain {
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
      ctx.beginPath(); ctx.moveTo(pos, 0); ctx.lineTo(pos, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, pos); ctx.lineTo(512, pos); ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);

    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshStandardMaterial({ map: texture, color: 0x111122, metalness: 0.3, roughness: 0.8 })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -0.1;
    mesh.receiveShadow = true;
    scene.add(mesh);
  }
}
