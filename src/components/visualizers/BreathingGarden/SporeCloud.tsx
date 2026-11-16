import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';
import { GardenTheme } from './BioluminescentFlora';

interface SporeCloudProps {
  visualState: MappedVisualState;
  theme?: GardenTheme;
  density?: 'low' | 'medium' | 'high';
}

export const SporeCloud: React.FC<SporeCloudProps> = ({
  visualState,
  theme = 'moonlight',
  density = 'medium',
}) => {
  const pointsRef = useRef<THREE.Points | null>(null);

  const count = useMemo(() => {
    switch (density) {
      case 'low': return 400;
      case 'high': return 1800;
      default: return 900;
    }
  }, [density]);

  const { positions, baseHeights, colors, drifts } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const heights = new Float32Array(count);
    const cols = new Float32Array(count * 3);
    const drf = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 1.4 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const y = Math.random() * 6.5;

      pos[i * 3] = Math.cos(angle) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(angle) * radius;

      heights[i] = y;
      drf[i] = Math.random() * Math.PI * 2;

      // Theme-based spore colors
      if (theme === 'twilight') {
        // Amethyst, Magenta, Orchid
        cols[i * 3] = 0.8 + Math.random() * 0.2;
        cols[i * 3 + 1] = 0.2 + Math.random() * 0.3;
        cols[i * 3 + 2] = 0.9 + Math.random() * 0.1;
      } else if (theme === 'amber') {
        // Golden pollen, Sunlit amber
        cols[i * 3] = 1.0;
        cols[i * 3 + 1] = 0.7 + Math.random() * 0.25;
        cols[i * 3 + 2] = 0.1 + Math.random() * 0.2;
      } else {
        // Moonlight Aqua, Emerald, Celadon
        cols[i * 3] = 0.1;
        cols[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        cols[i * 3 + 2] = 0.8 + Math.random() * 0.2;
      }
    }

    return { positions: pos, baseHeights: heights, colors: cols, drifts: drf };
  }, [count, theme]);

  useEffect(() => {
    return () => {
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.Material).dispose();
      }
    };
  }, [count]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const {
      normalizedBreath,
      breathPace,
      effectiveParticleSpeed,
      isReducedMotion,
    } = visualState;

    // Spores ascend gracefully on inhalation
    const lift = normalizedBreath * (isReducedMotion ? 0.45 : 1.25);

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const drift = drifts[i];
        const bobbing = Math.sin(t * 1.1 * breathPace + drift) * (isReducedMotion ? 0.1 : 0.35);
        arr[i3 + 1] = baseHeights[i] + bobbing + lift;
      }
      posAttr.needsUpdate = true;
      pointsRef.current.rotation.y = t * 0.04 * breathPace * effectiveParticleSpeed;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15 * visualState.effectiveBloomIntensity}
        vertexColors
        transparent
        opacity={0.8 * visualState.signalReliability}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
