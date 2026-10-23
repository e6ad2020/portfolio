import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { HeroPortrait } from './HeroPortrait';

interface SceneProps {
  onLoaded?: () => void;
}

export const Scene: React.FC<SceneProps> = ({ onLoaded }) => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 1.8]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: false
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      <Suspense fallback={null}>
        <HeroPortrait onReady={onLoaded} />
      </Suspense>
    </Canvas>
  );
};
