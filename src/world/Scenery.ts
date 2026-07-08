import * as THREE from 'three';

const BUILDINGS = [
  { x: -8, z: -8, w: 2, h: 4, d: 2, color: 0x442266, emit: 0x220044 },
  { x: 10, z: -6, w: 3, h: 6, d: 3, color: 0x226644, emit: 0x004422 },
  { x: -6, z: 12, w: 2.5, h: 3, d: 2.5, color: 0x664422, emit: 0x442200 },
  { x: 15, z: 10, w: 4, h: 8, d: 4, color: 0x224466, emit: 0x002244 },
  { x: -15, z: -12, w: 2, h: 5, d: 2, color: 0x662244, emit: 0x440022 },
  { x: 0, z: -20, w: 3, h: 7, d: 3, color: 0x444466, emit: 0x222244 },
  { x: -20, z: 5, w: 2, h: 4, d: 2, color: 0x664466, emit: 0x442244 },
  { x: 22, z: -15, w: 2.5, h: 3.5, d: 2.5, color: 0x446644, emit: 0x224422 },
];

const PATH_POINTS = [
  { x: 0, z: 0 }, { x: 5, z: -3 }, { x: 12, z: -5 }, { x: 18, z: -2 },
  { x: 3, z: 5 }, { x: -4, z: 10 }, { x: -10, z: 14 },
  { x: -5, z: -5 }, { x: -12, z: -10 }, { x: -18, z: -8 },
  { x: 8, z: 8 }, { x: 14, z: 12 }, { x: 20, z: 15 },
];

export class Scenery {
  constructor(scene: THREE.Scene) {
    for (const b of BUILDINGS) {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mat = new THREE.MeshStandardMaterial({ color: b.color, emissive: b.emit, emissiveIntensity: 0.2, metalness: 0.4, roughness: 0.5 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      scene.add(mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geo),
        new THREE.LineBasicMaterial({ color: 0x44ddff, transparent: true, opacity: 0.3 })
      );
      edges.position.copy(mesh.position);
      scene.add(edges);
    }

    for (let i = 0; i < PATH_POINTS.length - 1; i++) {
      const a = PATH_POINTS[i], b = PATH_POINTS[i + 1];
      const dx = b.x - a.x, dz = b.z - a.z;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(len, 0.4),
        new THREE.MeshBasicMaterial({ color: 0x44ddff, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI / 2;
      m.position.set((a.x + b.x) / 2, 0.01, (a.z + b.z) / 2);
      m.rotation.z = angle;
      scene.add(m);
    }

    const pillarPositions = [
      { x: 3, z: -2 }, { x: -3, z: 4 }, { x: 8, z: 6 },
      { x: -8, z: -5 }, { x: 0, z: -10 }, { x: 12, z: -8 },
      { x: -12, z: 8 }, { x: 16, z: 5 },
    ];
    for (const p of pillarPositions) {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.15, 2.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x44ddff, emissive: 0x44ddff, emissiveIntensity: 0.5, metalness: 0.8, roughness: 0.2 })
      );
      pillar.position.set(p.x, 1.25, p.z);
      scene.add(pillar);

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x44ddff, transparent: true, opacity: 0.6 })
      );
      glow.position.set(p.x, 2.6, p.z);
      scene.add(glow);
    }

    const ringPositions = [{ x: 0, z: 0 }, { x: 6, z: -4 }, { x: -5, z: 6 }, { x: 10, z: 10 }, { x: -10, z: -8 }];
    for (const p of ringPositions) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.8, 0.05, 8, 16),
        new THREE.MeshBasicMaterial({ color: 0xff44aa, transparent: true, opacity: 0.4 })
      );
      ring.position.set(p.x, 0.05, p.z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    }
  }
}
