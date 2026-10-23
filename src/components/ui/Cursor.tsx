import React, { useEffect, useRef } from 'react';

export const Cursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    if (
      window.matchMedia('(pointer: coarse)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isHovering = false;
    let isClicking = false;
    let isVisible = false;
    let currentScale = 0.45;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isVisible) {
        isVisible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, .project-card, .pillar-card, .interactive')) {
        isHovering = true;
      } else {
        isHovering = false;
      }
    };

    const onMouseDown = () => {
      isClicking = true;
    };

    const onMouseUp = () => {
      isClicking = false;
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    let animationId: number;
    const render = () => {
      // Ring follows mouse with smooth inertia
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      let targetScale = 0.45;
      if (isHovering) {
        targetScale = isClicking ? 0.78 : 1.0;
      } else {
        targetScale = isClicking ? 0.35 : 0.45;
      }

      currentScale += (targetScale - currentScale) * 0.18;

      if (ringRef.current && circleRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${currentScale.toFixed(4)})`;

        if (isHovering) {
          circleRef.current.setAttribute('stroke', isClicking ? '#ff7a00' : 'rgba(255, 85, 0, 0.75)');
          circleRef.current.setAttribute('fill', isClicking ? 'rgba(255, 85, 0, 0.16)' : 'rgba(255, 85, 0, 0.08)');
        } else {
          circleRef.current.setAttribute('stroke', isClicking ? 'rgba(0, 210, 255, 0.85)' : 'rgba(255, 255, 255, 0.28)');
          circleRef.current.setAttribute('fill', isClicking ? 'rgba(0, 210, 255, 0.1)' : 'transparent');
        }
      }

      animationId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    animationId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: -4,
          left: -4,
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: '#00d2ff',
          boxShadow: '0 0 10px rgba(0, 210, 255, 0.7)',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: 0,
          transition: 'opacity 0.3s ease',
          willChange: 'transform'
        }}
      />
      <svg
        ref={ringRef}
        aria-hidden="true"
        width={96}
        height={96}
        viewBox="0 0 96 96"
        style={{
          position: 'fixed',
          top: -48,
          left: -48,
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          willChange: 'transform',
          overflow: 'visible',
          transition: 'opacity 0.3s ease'
        }}
      >
        <circle
          ref={circleRef}
          cx={48}
          cy={48}
          r={40}
          stroke="rgba(255, 255, 255, 0.28)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          shapeRendering="geometricPrecision"
          fill="transparent"
          style={{
            transition: 'stroke 0.2s ease, fill 0.2s ease'
          }}
        />
      </svg>
    </>
  );
};
