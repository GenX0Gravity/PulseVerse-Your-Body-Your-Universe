import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

interface StarFieldProps {
  visualState?: MappedVisualState;
}

export const StarField: React.FC<StarFieldProps> = ({ visualState }) => {
  const pointsRef = useRef<THREE.Points | null>(null);
  const count = 1500;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Wide spherical boundary
      const radius = 30 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);
    }
    return pos;
  }, []);

  useEffect(() => {
    return () => {
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      const speed = visualState ? visualState.pulsePace * 0.015 : 0.015;
      pointsRef.current.rotation.y += speed * delta;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        color="#c8d6e5"
        transparent
        opacity={0.65}
        sizeAttenuation={true}
      />
    </points>
  );
};
