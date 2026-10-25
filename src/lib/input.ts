/**
 * src/lib/input.ts
 * Manages smoothed pointer (mouse), touch, gyro (mobile device orientation),
 * and dynamic multi-frequency idle drift for 3D parallax effects.
 */

export interface InputState {
  current: [number, number]; // Smoothed current pointer [-1, 1]
  target: [number, number];  // Target raw pointer [-1, 1]
  isTouch: boolean;
  hasGyro: boolean;
}

class InputController {
  private current: [number, number] = [0, 0];
  private target: [number, number] = [0, 0];
  private lerpFactor = 0.075;
  private isVisible = true;
  private idleTime = 0;
  private prefersReducedMotion = false;
  private isMobile = false;
  private baselineBeta: number | null = null;
  public hasGyro = false;

  constructor() {
    if (typeof window === 'undefined') return;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.onOrientation = this.onOrientation.bind(this);
    this.onVisibilityChange = this.onVisibilityChange.bind(this);

    window.addEventListener('mousemove', this.onMouseMove, { passive: true });
    document.addEventListener('mouseleave', this.onMouseLeave);
    window.addEventListener('blur', this.onMouseLeave);
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', this.onTouchEnd, { passive: true });
    document.addEventListener('visibilitychange', this.onVisibilityChange);

    // Setup gyroscope listener (including iOS 13+ permission unlock)
    this.setupGyro();
  }

  private setupGyro() {
    if (typeof window === 'undefined') return;

    // Check standard orientation support
    if ('DeviceOrientationEvent' in window) {
      // For iOS Safari: request permission on first user touch gesture
      const unlockiOSGyro = () => {
        if (
          typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
        ) {
          (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> })
            .requestPermission()
            .then((permissionState: string) => {
              if (permissionState === 'granted') {
                window.addEventListener('deviceorientation', this.onOrientation, { passive: true });
                this.hasGyro = true;
              }
            })
            .catch(() => {});
        } else {
          window.addEventListener('deviceorientation', this.onOrientation, { passive: true });
        }
        window.removeEventListener('touchstart', unlockiOSGyro);
      };

      window.addEventListener('touchstart', unlockiOSGyro, { passive: true });
      window.addEventListener('deviceorientation', this.onOrientation, { passive: true });
    }
  }

  /**
   * Edge safeguard: smoothly attenuates pointer near screen boundaries.
   * Prevents hard boundary slamming, UV clamp streaking, and perspective glitches
   * when the cursor reaches or scrapes along the edge of the monitor.
   */
  private edgeSafeAttenuate(val: number, maxLimit: number): number {
    const KNEE = 0.5;
    const sign = val >= 0 ? 1 : -1;
    const abs = Math.abs(val);
    if (abs <= KNEE) {
      return val * maxLimit;
    }
    // Smooth quadratic ease-out towards maxLimit in the outer 50% margin
    const t = Math.min(1.0, (abs - KNEE) / (1.0 - KNEE));
    const eased = KNEE + (1.0 - KNEE) * (1.0 - Math.pow(1.0 - t, 2));
    return sign * Math.min(maxLimit, eased * maxLimit);
  }

  private onMouseMove(e: MouseEvent) {
    if (this.prefersReducedMotion) return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = -(e.clientY / window.innerHeight) * 2 + 1;

    // Apply soft-knee boundary safety curves
    let safeX = this.edgeSafeAttenuate(nx, 0.8);
    let safeY = this.edgeSafeAttenuate(ny, 0.74);

    // Radial safety envelope: prevents compounded displacement in screen corners
    const dist = Math.hypot(safeX, safeY);
    if (dist > 0.84) {
      safeX = (safeX / dist) * 0.84;
      safeY = (safeY / dist) * 0.84;
    }

    this.target[0] = safeX;
    this.target[1] = safeY;
    this.idleTime = 0;
  }

  private onMouseLeave() {
    // Edge safeguard: when mouse exits browser window or tab loses focus,
    // smoothly glide the 3D subject back to neutral center facing forward
    this.target[0] = 0;
    this.target[1] = 0;
  }

  private onTouchStart(e: TouchEvent) {
    if (this.prefersReducedMotion || !e.touches[0]) return;
    if (typeof window !== 'undefined' && window.scrollY > 40) return;

    const touch = e.touches[0];
    const nx = (touch.clientX / window.innerWidth) * 2 - 1;
    const ny = -(touch.clientY / window.innerHeight) * 2 + 1;
    // Gentle touch response: thumb on screen should feel subtle, not jerk the 3D mesh
    this.target[0] = Math.max(-0.25, Math.min(0.25, nx * 0.25));
    this.target[1] = Math.max(-0.18, Math.min(0.18, ny * 0.18));
    this.idleTime = 0;
  }

  private onTouchMove(e: TouchEvent) {
    if (this.prefersReducedMotion || !e.touches[0]) return;
    if (typeof window !== 'undefined' && window.scrollY > 40) return;

    const touch = e.touches[0];
    const nx = (touch.clientX / window.innerWidth) * 2 - 1;
    const ny = -(touch.clientY / window.innerHeight) * 2 + 1;

    // Heavily damp vertical pitch on touch so vertical scrolling swipes do not pitch head back
    this.target[0] = Math.max(-0.25, Math.min(0.25, nx * 0.25));
    this.target[1] = Math.max(-0.18, Math.min(0.18, ny * 0.18));
    this.idleTime = 0;
  }

  private onTouchEnd() {
    // When finger is lifted, return target gently to center neutral
    this.target[0] = 0;
    this.target[1] = 0;
  }

  private onOrientation(e: DeviceOrientationEvent) {
    if (this.prefersReducedMotion || e.gamma === null || e.beta === null) return;
    this.hasGyro = true;

    // Smooth baseline holding angle initialization
    if (this.baselineBeta === null) {
      this.baselineBeta = e.beta;
    } else {
      // Very slowly drift baseline toward current pitch so changing posture doesn't freeze head
      this.baselineBeta += (e.beta - this.baselineBeta) * 0.005;
    }

    // gamma: left-to-right roll [-90, 90]. Natural handheld range is ~[-25, 25]
    // Scaled smoothly so normal hand movement produces subtle 3D without edge stretching
    const gx = Math.max(-0.35, Math.min(0.35, e.gamma / 45));

    // beta: front-to-back tilt relative to natural holding angle
    const relativeBeta = e.beta - this.baselineBeta;
    const gy = Math.max(-0.28, Math.min(0.28, relativeBeta / 38));

    this.target[0] = gx;
    this.target[1] = -gy;
    this.idleTime = 0;
  }

  private onVisibilityChange() {
    this.isVisible = !document.hidden;
  }

  /**
   * Called every animation frame (e.g. useFrame in R3F)
   * Smoothly interpolates toward target with an organic living breathing orbit
   */
  public update(delta: number = 0.016): [number, number] {
    if (!this.isVisible || this.prefersReducedMotion) {
      return [0, 0];
    }

    this.idleTime += delta;

    let targetX = this.target[0];
    let targetY = this.target[1];

    // Organic harmonic breathing drift:
    // Ensures the 3D depth and rim light are always alive and visible on phones
    // even if placed on a flat surface or held still.
    const t = this.idleTime * 0.85;
    const driftStrength = this.isMobile ? 0.10 : 0.15;
    const driftX = (Math.sin(t) * 0.7 + Math.sin(t * 0.35) * 0.3) * driftStrength;
    const driftY = (Math.cos(t * 0.75) * 0.7 + Math.sin(t * 1.4) * 0.3) * driftStrength * 0.65;

    // Blend idle drift smoothly with manual touch/gyro input
    const inputWeight = Math.min(1.0, Math.sqrt(this.target[0] * this.target[0] + this.target[1] * this.target[1]));
    const activeDriftX = driftX * (1.0 - inputWeight * 0.6);
    const activeDriftY = driftY * (1.0 - inputWeight * 0.6);

    targetX += activeDriftX;
    targetY += activeDriftY;

    // Edge safeguard: ensure targetX and targetY strictly stay within safety limits
    targetX = Math.max(-0.88, Math.min(0.88, targetX));
    targetY = Math.max(-0.82, Math.min(0.82, targetY));

    // Exponential smoothing
    this.current[0] += (targetX - this.current[0]) * this.lerpFactor;
    this.current[1] += (targetY - this.current[1]) * this.lerpFactor;

    // Absolute hard safeguard clamp on smoothed output
    this.current[0] = Math.max(-0.88, Math.min(0.88, this.current[0]));
    this.current[1] = Math.max(-0.82, Math.min(0.82, this.current[1]));

    return this.current;
  }

  public getPointer(): [number, number] {
    return this.current;
  }
}

export const input = typeof window !== 'undefined' ? new InputController() : (null as unknown as InputController);
