import * as THREE from 'three';

const JOYSTICK_RADIUS = 80;
const DEAD_ZONE = 10;

export class MobileControls {
  moveDir: THREE.Vector2 = new THREE.Vector2();
  aimDelta: THREE.Vector2 = new THREE.Vector2();
  isTouchingAim: boolean = false;
  enabled: boolean = false;

  private container: HTMLDivElement;
  private joystickEl: HTMLDivElement;
  private knobEl: HTMLDivElement;
  private aimZoneEl: HTMLDivElement;

  private joystickCenter: { x: number; y: number } = { x: 0, y: 0 };
  private joystickActive: boolean = false;
  private joystickTouchId: number | null = null;

  private lastAimX: number = 0;
  private lastAimY: number = 0;
  private aimTouchId: number | null = null;

  private boundOnTouchStart: (e: TouchEvent) => void;
  private boundOnTouchMove: (e: TouchEvent) => void;
  private boundOnTouchEnd: (e: TouchEvent) => void;

  constructor() {
    this.container = document.createElement('div');
    this.container.id = 'mobile-controls';
    this.container.style.cssText = `
      position: fixed; inset: 0; z-index: 1000;
      touch-action: none; pointer-events: none;
    `;

    this.joystickEl = document.createElement('div');
    this.joystickEl.className = 'joystick-zone';
    this.joystickEl.style.cssText = `
      position: absolute; left: 0; bottom: 0; width: 45%; height: 55%;
      pointer-events: auto;
    `;

    this.knobEl = document.createElement('div');
    this.knobEl.className = 'joystick-knob';
    this.knobEl.style.cssText = `
      position: absolute; width: 60px; height: 60px; border-radius: 50%;
      background: radial-gradient(circle, rgba(68,221,255,0.5), rgba(68,221,255,0.15));
      border: 2px solid rgba(68,221,255,0.4);
      transform: translate(-50%, -50%);
      pointer-events: none; display: none;
    `;
    this.joystickEl.appendChild(this.knobEl);

    this.aimZoneEl = document.createElement('div');
    this.aimZoneEl.className = 'aim-zone';
    this.aimZoneEl.style.cssText = `
      position: absolute; right: 0; top: 0; width: 55%; height: 100%;
      pointer-events: auto;
    `;

    this.container.appendChild(this.joystickEl);
    this.container.appendChild(this.aimZoneEl);

    this.boundOnTouchStart = this.onTouchStart.bind(this);
    this.boundOnTouchMove = this.onTouchMove.bind(this);
    this.boundOnTouchEnd = this.onTouchEnd.bind(this);
  }

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    document.body.appendChild(this.container);
    document.addEventListener('touchstart', this.boundOnTouchStart, { passive: false });
    document.addEventListener('touchmove', this.boundOnTouchMove, { passive: false });
    document.addEventListener('touchend', this.boundOnTouchEnd, { passive: false });
    document.addEventListener('touchcancel', this.boundOnTouchEnd, { passive: false });
  }

  disable(): void {
    if (!this.enabled) return;
    this.enabled = false;
    this.resetJoystick();
    this.resetAim();
    this.container.remove();
    document.removeEventListener('touchstart', this.boundOnTouchStart);
    document.removeEventListener('touchmove', this.boundOnTouchMove);
    document.removeEventListener('touchend', this.boundOnTouchEnd);
    document.removeEventListener('touchcancel', this.boundOnTouchEnd);
  }

  update(): void {
    if (!this.isTouchingAim) {
      this.aimDelta.x *= 0.85;
      this.aimDelta.y *= 0.85;
      if (Math.abs(this.aimDelta.x) < 0.001) this.aimDelta.x = 0;
      if (Math.abs(this.aimDelta.y) < 0.001) this.aimDelta.y = 0;
    }
  }

  private onTouchStart(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      if (!el) continue;

      if (this.joystickEl.contains(el) && this.joystickTouchId === null) {
        e.preventDefault();
        this.joystickTouchId = touch.identifier;
        this.joystickActive = true;
        this.joystickCenter = { x: touch.clientX, y: touch.clientY };
        this.knobEl.style.display = 'block';
        this.knobEl.style.left = touch.clientX + 'px';
        this.knobEl.style.top = touch.clientY + 'px';
      }

      if (this.aimZoneEl.contains(el) && this.aimTouchId === null) {
        e.preventDefault();
        this.aimTouchId = touch.identifier;
        this.isTouchingAim = true;
        this.lastAimX = touch.clientX;
        this.lastAimY = touch.clientY;
      }
    }
  }

  private onTouchMove(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.joystickTouchId) {
        e.preventDefault();
        const dx = touch.clientX - this.joystickCenter.x;
        const dy = touch.clientY - this.joystickCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let clampedX = dx;
        let clampedY = dy;
        if (dist > JOYSTICK_RADIUS) {
          clampedX = (dx / dist) * JOYSTICK_RADIUS;
          clampedY = (dy / dist) * JOYSTICK_RADIUS;
        }

        this.knobEl.style.left = (this.joystickCenter.x + clampedX) + 'px';
        this.knobEl.style.top = (this.joystickCenter.y + clampedY) + 'px';

        if (dist < DEAD_ZONE) {
          this.moveDir.set(0, 0);
        } else {
          const normX = clampedX / JOYSTICK_RADIUS;
          const normY = clampedY / JOYSTICK_RADIUS;
          this.moveDir.set(normX, -normY);
        }
      }

      if (touch.identifier === this.aimTouchId) {
        e.preventDefault();
        const dx = touch.clientX - this.lastAimX;
        const dy = touch.clientY - this.lastAimY;
        this.lastAimX = touch.clientX;
        this.lastAimY = touch.clientY;
        this.aimDelta.x += dx * 0.01;
        this.aimDelta.y += dy * 0.01;
      }
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];

      if (touch.identifier === this.joystickTouchId) {
        this.resetJoystick();
      }

      if (touch.identifier === this.aimTouchId) {
        this.resetAim();
      }
    }
  }

  private resetJoystick(): void {
    this.joystickTouchId = null;
    this.joystickActive = false;
    this.moveDir.set(0, 0);
    this.knobEl.style.display = 'none';
  }

  private resetAim(): void {
    this.aimTouchId = null;
    this.isTouchingAim = false;
  }

  destroy(): void {
    this.disable();
  }
}
