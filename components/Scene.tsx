import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import ParticleSystem from './ParticleSystem';
import PhotoGallery from './PhotoGallery';
import { useAppStore } from '../store';
import { AppPhase } from '../types';

const Scene: React.FC = () => {
  const phase = useAppStore(s => s.phase);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 35], fov: 50 }}
      gl={{ antialias: false, alpha: false }}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Lighting - Essential for MeshStandardMaterial (Gold Borders) */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[0, 0, 10]} intensity={1} />
      
      {/* Background Stars */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Main Content - Separated Suspense to prevent Gallery loading from blocking Particles */}
      <Suspense fallback={null}>
        <ParticleSystem />
      </Suspense>

      <Suspense fallback={null}>
        <PhotoGallery />
      </Suspense>

      {/* Post Processing */}
      <EffectComposer disableNormalPass>
        {/* Adjusted bloom: threshold 0.8 allows Gold (brightness ~0.8-1.0) to glow slightly */}
        <Bloom 
            luminanceThreshold={0.8} 
            mipmapBlur 
            intensity={0.8} 
            radius={0.4}
        />
      </EffectComposer>

      <OrbitControls 
        autoRotate={phase === AppPhase.IDLE || phase === AppPhase.TREE_FORMATION}
        autoRotateSpeed={0.5}
        enableZoom={false} 
        enablePan={false}
        maxDistance={60}
        minDistance={5}
        minPolarAngle={Math.PI / 2 - 0.2}
        maxPolarAngle={Math.PI / 2 + 0.2}
        // Lock controls during photo phase
        enabled={phase !== AppPhase.PHOTO_WALL}
      />
    </Canvas>
  );
};

export default Scene;