import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { AppPhase } from '../types';
import { 
  PARTICLE_COUNT, 
  getTextPositions, 
  getTreePositions, 
  getSpherePositions, 
  getGalaxyPositions 
} from '../utils/shapes';

const ParticleSystem: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const phase = useAppStore((state) => state.phase);

  // Initialize buffers
  const currentPositions = useMemo(() => {
    return getSpherePositions(PARTICLE_COUNT, 30);
  }, []);

  const targetPositions = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), []);
  
  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    const c = new THREE.Color('#FFD700');
    for(let i=0; i<PARTICLE_COUNT; i++) {
      arr[i*3] = c.r;
      arr[i*3+1] = c.g;
      arr[i*3+2] = c.b;
    }
    return arr;
  }, []);

  useEffect(() => {
    let newPos: Float32Array;
    let newColors: Float32Array | null = null;
    const gold = new THREE.Color('#FFD700');

    const setSolidColor = (color: THREE.Color) => {
        const cArr = new Float32Array(PARTICLE_COUNT * 3);
        for(let i=0; i<PARTICLE_COUNT; i++) {
            cArr[i*3] = color.r;
            cArr[i*3+1] = color.g;
            cArr[i*3+2] = color.b;
        }
        return cArr;
    };

    switch (phase) {
      case AppPhase.IDLE:
        newPos = getSpherePositions(PARTICLE_COUNT, 15);
        newColors = setSolidColor(gold);
        break;
      case AppPhase.COUNTDOWN_5:
        newPos = getTextPositions("5", PARTICLE_COUNT);
        newColors = setSolidColor(gold);
        break;
      case AppPhase.COUNTDOWN_4:
        newPos = getTextPositions("4", PARTICLE_COUNT);
        break;
      case AppPhase.COUNTDOWN_3:
        newPos = getTextPositions("3", PARTICLE_COUNT);
        break;
      case AppPhase.COUNTDOWN_2:
        newPos = getTextPositions("2", PARTICLE_COUNT);
        break;
      case AppPhase.COUNTDOWN_1:
        newPos = getTextPositions("1", PARTICLE_COUNT);
        break;
      case AppPhase.YEAR_REVEAL:
        newPos = getTextPositions("2026", PARTICLE_COUNT, 200);
        newColors = setSolidColor(new THREE.Color('#FFFACD'));
        break;
      case AppPhase.TREE_FORMATION:
        const treeData = getTreePositions(PARTICLE_COUNT);
        newPos = treeData.positions;
        newColors = treeData.colors;
        break;
      case AppPhase.PHOTO_WALL:
        // Scatter particles to form a background starfield for the photos
        newPos = getSpherePositions(PARTICLE_COUNT, 50); 
        newColors = setSolidColor(new THREE.Color('#FFFFFF'));
        break;
      default:
        newPos = getSpherePositions(PARTICLE_COUNT, 10);
    }

    targetPositions.set(newPos);
    
    if (newColors && pointsRef.current) {
         pointsRef.current.geometry.attributes.color.array.set(newColors);
         pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }

  }, [phase, targetPositions]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    const speed = 0.08;
    const noiseStrength = 0.05;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const cx = positions[ix];
      const cy = positions[iy];
      const cz = positions[iz];

      const tx = targetPositions[ix];
      const ty = targetPositions[iy];
      const tz = targetPositions[iz];

      positions[ix] += (tx - cx) * speed;
      positions[iy] += (ty - cy) * speed;
      positions[iz] += (tz - cz) * speed;

      if (phase === AppPhase.TREE_FORMATION) {
           // Stable tree
      } else {
           // Gentle noise
           positions[ix] += Math.sin(t + iy) * noiseStrength * 0.2;
           positions[iy] += Math.cos(t + ix) * noiseStrength * 0.2;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    
    if (phase === AppPhase.TREE_FORMATION) {
        pointsRef.current.rotation.y += 0.005;
    } else if (phase === AppPhase.PHOTO_WALL) {
        // Slow rotation for background effect
        pointsRef.current.rotation.y += 0.001;
    } else {
        pointsRef.current.rotation.y = Math.sin(t * 0.1) * 0.2;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={currentPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={phase === AppPhase.PHOTO_WALL ? 0.3 : 0.9} // Dim particles in photo phase
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleSystem;