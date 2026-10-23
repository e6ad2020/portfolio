/**
 * src/lib/motion.ts
 * Coordinates Lenis smooth scrolling with GSAP ticker & ScrollTrigger.
 * Optimized for buttery 120Hz native touch momentum on mobile with zero input lag,
 * and luxurious smooth wheel scrolling on desktop.
 */
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

let lenisInstance: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
  if (typeof window === 'undefined') return null;
  if (lenisInstance) return lenisInstance;

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    // On touch devices (phones/tablets), syncTouch: false allows native browser compositor
    // touch scrolling with 0ms latency and 120Hz hardware momentum, while Lenis keeps
    // ScrollTrigger synchronized via window scroll events.
    syncTouch: false,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.0,
  });

  lenisInstance = lenis;

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
