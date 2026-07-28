import * as THREE from 'three';

import { MobileControls } from './MobileControls';

export class CameraController {
  private camera: THREE.PerspectiveCamera;
  private getPlayerPos: () => THREE.Vector3;
  private raycaster: THREE.Raycaster;
  private groundPlane: THREE.Plane;
  private mouse: THREE.Vector2;
  private eyeHeight: number = 1.6;
  private touchYawOffset: number = 0;
  private touchPitchOffset: number = 0;

  aimPoint: THREE.Vector3;
  mobileControls: MobileControls | null = null;

  constructor(camera: THREE.PerspectiveCamera, getPlayerPos: () => THREE.Vector3) {
    this.camera = camera;
    this.getPlayerPos = getPlayerPos;
    this.raycaster = new THREE.Raycaster();
    this.groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    this.mouse = new THREE.Vector2();
    this.aimPoint = new THREE.Vector3(0, 0, -5);

    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  update(_delta: number): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersectPoint = new THREE.Vector3();
    const ray = this.raycaster.ray;

    if (ray.intersectPlane(this.groundPlane, intersectPoint)) {
      this.aimPoint.copy(intersectPoint);
    } else {
      const pos = this.getPlayerPos();
      const dir = ray.direction.clone();
      if (dir.y > 0) dir.y = 0;
      dir.normalize();
      this.aimPoint.copy(pos).add(dir.multiplyScalar(10));
    }

    if (this.mobileControls) {
      this.touchYawOffset -= this.mobileControls.aimDelta.x * 2;
      this.touchPitchOffset -= this.mobileControls.aimDelta.y * 2;

      const playerPos = this.getPlayerPos();
      const toAim = new THREE.Vector3().copy(this.aimPoint).sub(playerPos);
      const dist = toAim.length();
      if (dist > 0.01) {
        const angle = Math.atan2(toAim.x, toAim.z);
        const newAngle = angle + this.touchYawOffset * 0.05;
        toAim.x = dist * Math.sin(newAngle);
        toAim.z = dist * Math.cos(newAngle);
        toAim.y += this.touchPitchOffset * 0.05;
        this.aimPoint.copy(playerPos).add(toAim);
      }
    }

    const playerPos = this.getPlayerPos();
    const eyePos = new THREE.Vector3(playerPos.x, playerPos.y + this.eyeHeight, playerPos.z);
    this.camera.position.copy(eyePos);

    const lookTarget = this.aimPoint.clone();
    lookTarget.y += 0.5;
    this.camera.lookAt(lookTarget);
  }

  destroy(): void {
    document.removeEventListener('mousemove', () => {});
  }
}
