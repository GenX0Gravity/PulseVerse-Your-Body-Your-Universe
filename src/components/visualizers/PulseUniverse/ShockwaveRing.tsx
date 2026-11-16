import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

interface ShockwaveRingProps {
  visualState: MappedVisualState;
}

export const ShockwaveRing: React.FC<ShockwaveRingProps> = ({ visualState }) => {
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const waveRadius1 = useRef<number>(1.0);
  const waveRadius2 = useRef<number>(1.0);

  useFrame((_, delta) => {
    const {
      cardiacDeflection,
      effectiveShockwaveScale,
      signalReliability,
      isReducedMotion,
    } = visualState;

    // Expand rings continuously outward
    const speed = 7.5 * delta;
    waveRadius1.current += speed;
    waveRadius2.current += speed * 0.75;

    // Re-trigger from center on sharp cardiac systolic spike
    if (cardiacDeflection > 0.85 && waveRadius1.current > 6.0) {
      waveRadius1.current = 1.2;
    }
    if (cardiacDeflection > 0.85 && waveRadius2.current > 7.0) {
      waveRadius2.current = 1.2;
    }

    // Wrap around gracefully if no spike arrives
    if (waveRadius1.current > 18.0) waveRadius1.current = 1.2;
    if (waveRadius2.current > 18.0) waveRadius2.current = 1.2;

    const maxRadius = 18.0;

    if (ring1Ref.current) {
      const r = waveRadius1.current;
      ring1Ref.current.scale.set(r, r, r);
      const alpha = Math.max(0, (1 - r / maxRadius) * 0.75 * signalReliability * (isReducedMotion ? 0.35 : 1.0));
      (ring1Ref.current.material as THREE.MeshBasicMaterial).opacity = alpha * effectiveShockwaveScale;
    }

    if (ring2Ref.current) {
      const r = waveRadius2.current;
      ring2Ref.current.scale.set(r, r, r);
      const alpha = Math.max(0, (1 - r / maxRadius) * 0.45 * signalReliability * (isReducedMotion ? 0.35 : 1.0));
      (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity = alpha * effectiveShockwaveScale;
    }
  });

  return (
    <group rotation={[-Math.PI / 2.3, 0, 0]}>
      {/* Primary Equator Shockwave Ring */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.96, 1.0, 64]} />
        <meshBasicMaterial
          color="#00f2fe"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary Harmonic Echo Ring */}
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.97, 1.0, 64]} />
        <meshBasicMaterial
          color="#ec4899"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};
