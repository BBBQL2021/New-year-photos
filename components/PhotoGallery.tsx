import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Image, Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '../store';
import { AppPhase, GalleryItem } from '../types';
import { easing } from 'maath';

const GOLD_COLOR = new THREE.Color('#FFD700');
const FRAME_THICKNESS = 0.02;

// Pre-compute geometries/materials
const frameMaterial = new THREE.MeshPhysicalMaterial({
  color: GOLD_COLOR,
  metalness: 1,
  roughness: 0.15,
  clearcoat: 1,
  emissive: '#FFD700',
  emissiveIntensity: 0.2,
});

const PhotoGallery: React.FC = () => {
  const { galleryImages, phase, activePhotoIndex, setActivePhotoIndex } = useAppStore();
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  
  const isMobile = viewport.width < 8;
  const isVisible = phase === AppPhase.PHOTO_WALL;

  // Zoom State (Target Z position of camera)
  const [zoomZ, setZoomZ] = useState(35);

  // Pan State (Offset from center)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPointerPos = useRef({ x: 0, y: 0 });
  const totalDragDelta = useRef(0);

  // Mouse Wheel Zoom Handler
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (phase !== AppPhase.PHOTO_WALL) return;
      setZoomZ(prev => THREE.MathUtils.clamp(prev + e.deltaY * 0.02, 10, 60));
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [phase]);

  // Drag Pan Handler
  useEffect(() => {
    if (phase !== AppPhase.PHOTO_WALL) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // Left click only
      isDragging.current = true;
      lastPointerPos.current = { x: e.clientX, y: e.clientY };
      totalDragDelta.current = 0;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - lastPointerPos.current.x;
      const dy = e.clientY - lastPointerPos.current.y;
      
      totalDragDelta.current += Math.abs(dx) + Math.abs(dy);
      lastPointerPos.current = { x: e.clientX, y: e.clientY };

      const sensitivity = 0.015;
      setPan(prev => ({
        x: prev.x + dx * sensitivity,
        y: prev.y - dy * sensitivity // Drag up moves content up
      }));
    };

    const handlePointerUp = () => {
      isDragging.current = false;
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [phase]);

  const canClick = () => totalDragDelta.current < 5;

  // Split items into rings based on their stored orientation
  const { landscapeItems, portraitItems } = useMemo(() => {
    const l: { item: GalleryItem; globalIndex: number }[] = [];
    const p: { item: GalleryItem; globalIndex: number }[] = [];
    
    galleryImages.forEach((item, i) => {
      if (item.orientation === 'landscape') l.push({ item, globalIndex: i });
      else p.push({ item, globalIndex: i });
    });
    
    return { landscapeItems: l, portraitItems: p };
  }, [galleryImages]);

  // Determine which ring is active
  const activeItem = galleryImages[activePhotoIndex];
  const activeOrientation = activeItem ? activeItem.orientation : 'portrait';
  
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Visibility Scale
    const targetScale = isVisible ? 1 : 0;
    easing.damp3(groupRef.current.scale, [targetScale, targetScale, targetScale], 0.5, delta);
    
    // Vertical Shift Group (Auto orientation + Manual Pan)
    const autoY = activeOrientation === 'landscape' ? -1.8 : 1.8;
    const targetY = autoY + pan.y;
    const targetX = pan.x;

    easing.damp3(groupRef.current.position, [targetX, isVisible ? targetY : -20, 0], 0.2, delta);

    // Camera Zoom Control
    if (isVisible) {
      easing.damp(state.camera.position, 'z', zoomZ, 0.5, delta);
    }
  });

  return (
    <group ref={groupRef} visible={isVisible}>
      {/* Landscape Ring (Top) */}
      <Ring 
        items={landscapeItems} 
        activeGlobalIndex={activePhotoIndex}
        radius={isMobile ? 4.5 : 7} 
        yPosition={1.8}
        onSelect={setActivePhotoIndex}
        orientation="landscape"
        isMobile={isMobile}
        canClick={canClick}
      />

      {/* Portrait Ring (Bottom) */}
      <Ring 
        items={portraitItems} 
        activeGlobalIndex={activePhotoIndex}
        radius={isMobile ? 4.5 : 7} 
        yPosition={-1.8}
        onSelect={setActivePhotoIndex}
        orientation="portrait"
        isMobile={isMobile}
        canClick={canClick}
      />
    </group>
  );
};

interface RingProps {
  items: { item: GalleryItem; globalIndex: number }[];
  activeGlobalIndex: number;
  radius: number;
  yPosition: number;
  onSelect: (index: number) => void;
  orientation: 'landscape' | 'portrait';
  isMobile: boolean;
  canClick: () => boolean;
}

const Ring: React.FC<RingProps> = ({ 
  items, activeGlobalIndex, radius, yPosition, onSelect, orientation, isMobile, canClick
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const localActiveIndex = items.findIndex(x => x.globalIndex === activeGlobalIndex);
  const isActiveRing = localActiveIndex !== -1;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    let targetRotation = 0;
    if (isActiveRing) {
      const anglePerItem = (Math.PI * 2) / Math.max(items.length, 1);
      targetRotation = -localActiveIndex * anglePerItem;
    } else {
      groupRef.current.rotation.y += delta * 0.05;
      return; 
    }
    easing.damp(groupRef.current.rotation, 'y', targetRotation, 0.5, delta);
  });

  if (items.length === 0) return null;
  const angleStep = (Math.PI * 2) / items.length;

  return (
    <group ref={groupRef} position={[0, yPosition, 0]}>
      {items.map((x, i) => {
        const angle = i * angleStep;
        const posX = Math.sin(angle) * radius;
        const posZ = Math.cos(angle) * radius;
        
        return (
          <FrameItem 
            key={x.item.id}
            item={x.item}
            globalIndex={x.globalIndex}
            position={[posX, 0, posZ]}
            rotation={[0, angle, 0]}
            isActive={x.globalIndex === activeGlobalIndex}
            onClick={() => {
                if(canClick()) onSelect(x.globalIndex);
            }}
            orientation={orientation}
            isMobile={isMobile}
          />
        );
      })}
    </group>
  );
};

interface FrameItemProps {
  item: GalleryItem;
  globalIndex: number;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
  onClick: () => void;
  orientation: 'landscape' | 'portrait';
  isMobile: boolean;
}

const FrameItem: React.FC<FrameItemProps> = ({ 
  item, globalIndex, position, rotation, isActive, onClick, orientation, isMobile 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  useCursor(hovered);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const baseScale = isActive ? 1.2 : 1.0;
    const hoverScale = hovered ? 1.05 : 1.0;
    const targetScale = baseScale * hoverScale;
    easing.damp3(meshRef.current.scale, [targetScale, targetScale, targetScale], 0.3, delta);
  });

  const width = orientation === 'landscape' ? 1.8 : 1.2;
  const height = orientation === 'landscape' ? 1.2 : 1.6;
  const frameW = width + 0.05;
  const frameH = height + 0.05;

  return (
    <group 
      ref={meshRef} 
      position={position} 
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <mesh position={[0, 0, -0.01]} material={frameMaterial}>
        <boxGeometry args={[frameW, frameH, FRAME_THICKNESS]} />
      </mesh>
      <Image 
        url={item.url} 
        transparent 
        side={THREE.DoubleSide}
        scale={[width, height, 1]}
        position={[0, 0, FRAME_THICKNESS / 2 + 0.001]} 
      />
      {isActive && (
         <pointLight distance={3} intensity={2} color="#ffaa00" position={[0, 0, 1]} />
      )}
      {isActive && (
        <group position={[0, -height/2 - 0.2, 0]}>
           <Text
              fontSize={0.1}
              color="#FFD700"
              anchorX="center"
              anchorY="top"
              outlineWidth={0.005}
              outlineColor="#000"
           >
              ARTWORK {(globalIndex + 1).toString().padStart(2, '0')}
           </Text>
        </group>
      )}
    </group>
  );
};

export default PhotoGallery;