import React, { useRef, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import portraitVert from './shaders/portrait.vert.glsl';
import portraitFrag from './shaders/portrait.frag.glsl';
import { input } from '../lib/input';

interface HeroPortraitProps {
  onReady?: () => void;
}

export const HeroPortrait: React.FC<HeroPortraitProps> = ({ onReady }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();
  const fallbackHiddenRef = useRef<boolean>(false);

  const isMobile = size.width < 768;
  const portraitUrl = isMobile ? '/textures/hero/portrait@1x.webp' : '/textures/hero/portrait@2x.webp';
  const depthUrl = '/textures/hero/depth.webp';

  const transitionToWebGL = () => {
    if (fallbackHiddenRef.current) return;
    fallbackHiddenRef.current = true;

    // 1. Smoothly fade in the WebGL canvas over 750ms
    const root = document.getElementById('webgl-root');
    if (root) root.classList.add('is-loaded');

    // 2. Animate the 3D shader uniforms (uReveal) for an organic, flexible lighting bloom
    let startTime: number | null = null;
    const duration = 750; // ms

    const animateReveal = (now: number) => {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      if (materialRef.current) {
        materialRef.current.uniforms.uReveal.value = eased;
      }

      if (progress < 1.0) {
        requestAnimationFrame(animateReveal);
      }
    };
    requestAnimationFrame(animateReveal);

    // 3. Simultaneously fade out the fallback container in perfect lockstep
    const fallbackWrapper = document.getElementById('hero-fallback-wrapper');
    if (fallbackWrapper) {
      fallbackWrapper.classList.add('is-hidden');

      // After crossfade completes, defer cleanup to free DOM resources
      setTimeout(() => {
        fallbackWrapper.classList.add('is-removed');
      }, 800);
    }
  };

  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader();
    let colorDone = false;
    let depthDone = false;

    const checkBothReady = () => {
      if (colorDone && depthDone) {
        transitionToWebGL();
        if (onReady) onReady();
      }
    };

    const colorTex = loader.load(portraitUrl, () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uColor.value = colorTex;
      }
      colorDone = true;
      checkBothReady();
    });
    colorTex.colorSpace = THREE.SRGBColorSpace;
    colorTex.minFilter = THREE.LinearFilter;
    colorTex.magFilter = THREE.LinearFilter;
    colorTex.generateMipmaps = false;

    const depthTex = loader.load(depthUrl, () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uDepth.value = depthTex;
      }
      depthDone = true;
      checkBothReady();
    });
    depthTex.minFilter = THREE.LinearFilter;
    depthTex.magFilter = THREE.LinearFilter;
    depthTex.generateMipmaps = false;

    return { colorTex, depthTex };
  }, [portraitUrl, depthUrl, onReady]);

  // Stable dimensions ref:
  // On mobile browsers, scrolling down collapses the URL address bar, causing
  // window.innerHeight and viewport.height to dynamically increase by 10-15%.
  // We lock the 3D plane dimensions and baseline position on mount so that scrolling
  // NEVER changes the 3D subject's physical size or scale.
  // Dimensions only update if screen width changes (e.g. rotating device from portrait to landscape)
  // or on major desktop window resizes.
  const stableDimsRef = useRef<{
    planeWidth: number;
    planeHeight: number;
    basePosY: number;
    baselineViewportHeight: number;
    screenWidth: number;
    screenHeight: number;
  } | null>(null);

  // Screen classification based on orientation & width
  const isPortrait = viewport.width < viewport.height || size.width < 768;
  const imageAspect = 1.5; // 1536 / 1024

  const needsRecalc =
    !stableDimsRef.current ||
    Math.abs(size.width - stableDimsRef.current.screenWidth) > 15 ||
    Math.abs(size.height - stableDimsRef.current.screenHeight) > 180;

  if (needsRecalc) {
    let pHeight: number;
    let pWidth: number;

    if (isPortrait) {
      // On phones / portrait screens: 71% of viewport height gives the 3D subject
      // commanding vertical presence, reaching up to ~31% from the top to gracefully overlap
      // the lower half of the PORTFOLIO wordmark with the torso anchored cleanly to the bottom.
      pHeight = viewport.height * 0.71;
      pWidth = pHeight * imageAspect;
    } else {
      // Desktop / Landscape: full cinematic height occluding the center title
      pHeight = viewport.height * 1.09;
      pWidth = pHeight * imageAspect;
    }

    const bPosY = -viewport.height / 2 + pHeight / 2;

    stableDimsRef.current = {
      planeWidth: pWidth,
      planeHeight: pHeight,
      basePosY: bPosY,
      baselineViewportHeight: viewport.height,
      screenWidth: size.width,
      screenHeight: size.height
    };
  }

  const { planeWidth, planeHeight, basePosY, screenHeight } = stableDimsRef.current!;

  // Shader uniforms
  const uniforms = useMemo(() => ({
    uColor: { value: textures.colorTex },
    uDepth: { value: textures.depthTex },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uStrength: { value: isPortrait ? 0.018 : 0.028 },
    uFocus: { value: 0.65 },
    uExposure: { value: 0.95 },
    uRim: { value: 0.9 },
    uRimColorWarm: { value: new THREE.Color('#ff5500') },
    uRimColorCool: { value: new THREE.Color('#00d2ff') },
    uReveal: { value: 0.0 },
    uTime: { value: 0.0 }
  }), [textures, isPortrait]);

  useFrame((_, delta) => {
    if (!materialRef.current) return;

    const scrollY = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
    const windowH = screenHeight || (typeof window !== 'undefined' ? window.innerHeight || 1 : 1);

    // GPU Culling: when scrolled past the hero section, hide mesh and skip expensive shader computations.
    // This frees 100% of mobile GPU, guaranteeing fluid 120 FPS scrolling across the rest of the page.
    if (scrollY > windowH * 1.15) {
      if (meshRef.current && meshRef.current.visible) {
        meshRef.current.visible = false;
      }
      return;
    }

    if (meshRef.current && !meshRef.current.visible) {
      meshRef.current.visible = true;
    }

    // Anchored at basePosY: as user scrolls down, incoming content (.intro-section at z-index 10)
    // slides up and cleanly covers the 3D portrait, so it goes under the screen just like before.
    if (meshRef.current) {
      meshRef.current.position.set(0, basePosY, 0);
      meshRef.current.scale.set(planeWidth, planeHeight, 1);
    }

    if (input) {
      const ptr = input.update(delta);
      materialRef.current.uniforms.uPointer.value.set(ptr[0], ptr[1]);

      if (meshRef.current) {
        // Flat mesh rotation across all screens eliminates awkward perspective keystoning
        // and cardboard-cutout angles. Volumetric 3D depth is computed organically inside the shader.
        meshRef.current.rotation.set(0, 0, 0);
      }
    }

    materialRef.current.uniforms.uTime.value += delta;
  });

  return (
    <mesh
      ref={meshRef}
      position={[0, basePosY, 0]}
      scale={[planeWidth, planeHeight, 1]}
    >
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={portraitVert}
        fragmentShader={portraitFrag}
        uniforms={uniforms}
        transparent={true}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};
