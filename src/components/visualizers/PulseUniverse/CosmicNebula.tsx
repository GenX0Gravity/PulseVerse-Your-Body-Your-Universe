import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';
import { PulseUniversePreset } from '../../../types/experiences';

interface CosmicNebulaProps {
  visualState: MappedVisualState;
  preset?: PulseUniversePreset;
  particleDensity?: 'low' | 'medium' | 'high';
}

export const CosmicNebula: React.FC<CosmicNebulaProps> = ({
  visualState,
  preset = 'supernova',
  particleDensity = 'medium',
}) => {
  const pointsRef = useRef<THREE.Points | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const coronaRef = useRef<THREE.Mesh | null>(null);
  const shellRef = useRef<THREE.Mesh | null>(null);

  // Particle counts based on device performance setting
  const count = useMemo(() => {
    switch (particleDensity) {
      case 'low': return 1600;
      case 'high': return 7500;
      default: return 3600;
    }
  }, [particleDensity]);

  const { positions, colors, originalPositions, randomOffsets } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const rnd = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Logarithmic spiral galaxy structure
      const armIndex = i % 4;
      const armAngle = (armIndex * Math.PI * 2) / 4;
      const dist = Math.pow(Math.random(), 1.6) * 16 + 1.2;
      const spiral = dist * 0.75;

      const spreadX = (Math.random() - 0.5) * 1.6;
      const spreadY = (Math.random() - 0.5) * 1.4 * (1 - dist / 18);
      const spreadZ = (Math.random() - 0.5) * 1.6;

      const x = Math.cos(armAngle + spiral) * dist + spreadX;
      const y = spreadY;
      const z = Math.sin(armAngle + spiral) * dist + spreadZ;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      rnd[i * 3] = Math.random() * Math.PI * 2;
      rnd[i * 3 + 1] = 0.5 + Math.random() * 0.5;
      rnd[i * 3 + 2] = Math.random();

      // Color gradation by preset
      const ratio = Math.min(1.0, dist / 16);
      if (preset === 'quantum-void') {
        // Deep Cyan into Ethereal Indigo and Violet
        col[i * 3] = 0.15 + ratio * 0.45;
        col[i * 3 + 1] = 0.75 - ratio * 0.35;
        col[i * 3 + 2] = 0.95;
      } else if (preset === 'stellar-core') {
        // Solar Gold to Crimson Amber
        col[i * 3] = 1.0;
        col[i * 3 + 1] = 0.85 - ratio * 0.65;
        col[i * 3 + 2] = 0.2 + ratio * 0.3;
      } else {
        // Supernova (Cyan Core to Radiant Magenta & Rose Periphery)
        col[i * 3] = 0.2 + ratio * 0.8;
        col[i * 3 + 1] = 0.95 - ratio * 0.7;
        col[i * 3 + 2] = 0.85 + ratio * 0.15;
      }
    }

    return {
      positions: pos,
      colors: col,
      originalPositions: orig,
      randomOffsets: rnd,
    };
  }, [count, preset]);

  // Clean disposal on unmount or density change
  useEffect(() => {
    return () => {
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        if (Array.isArray(pointsRef.current.material)) {
          pointsRef.current.material.forEach((m) => m.dispose());
        } else {
          pointsRef.current.material.dispose();
        }
      }
      if (coreRef.current) {
        coreRef.current.geometry.dispose();
        (coreRef.current.material as THREE.Material).dispose();
      }
      if (coronaRef.current) {
        coronaRef.current.geometry.dispose();
        (coronaRef.current.material as THREE.Material).dispose();
      }
      if (shellRef.current) {
        shellRef.current.geometry.dispose();
        (shellRef.current.material as THREE.Material).dispose();
      }
    };
  }, [count]);

  // Frame animation driven strictly by smoothed visualState
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    const {
      pulsePace,
      cardiacDeflection,
      breathExpansion,
      effectiveParticleSpeed,
      isReducedMotion,
    } = visualState;

    // Rhythmic rotation paced by pulse rate
    const rotSpeed = 0.06 * pulsePace * effectiveParticleSpeed;

    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * rotSpeed;
      pointsRef.current.rotation.z = Math.sin(t * rotSpeed * 0.6) * 0.08;

      const posAttr = pointsRef.current.geometry.attributes.position;
      const currentPos = posAttr.array as Float32Array;

      // When systolic deflection peaks, particles radiate outward momentarily
      const pulseImpulse = isReducedMotion
        ? cardiacDeflection * 0.08
        : cardiacDeflection * 0.35;

      const breathScale = 1.0 + breathExpansion * 0.12;

      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];
        const phase = randomOffsets[i3];
        const freq = randomOffsets[i3 + 1];

        // Ambient gentle orbital shimmer
        const shimmer = Math.sin(t * freq * 1.5 + phase) * (isReducedMotion ? 0.04 : 0.14);

        const totalScale = (1.0 + pulseImpulse + shimmer) * breathScale;

        currentPos[i3] = ox * totalScale;
        currentPos[i3 + 1] = oy * totalScale + Math.sin(t + phase) * 0.05;
        currentPos[i3 + 2] = oz * totalScale;
      }
      posAttr.needsUpdate = true;
    }

    // Animate central glowing energy sphere
    if (coreRef.current) {
      const baseScale = 1.2;
      const corePulse = cardiacDeflection * (isReducedMotion ? 0.15 : 0.45);
      const s = baseScale + corePulse;
      coreRef.current.scale.set(s, s, s);
      coreRef.current.rotation.y = t * 0.4;
    }

    if (coronaRef.current) {
      const coronaScale = 1.6 + cardiacDeflection * (isReducedMotion ? 0.2 : 0.7);
      coronaRef.current.scale.set(coronaScale, coronaScale, coronaScale);
      coronaRef.current.rotation.x = t * -0.25;
      coronaRef.current.rotation.z = t * 0.15;
    }

    if (shellRef.current) {
      const shellScale = 2.1 + breathExpansion * 0.15;
      shellRef.current.scale.set(shellScale, shellScale, shellScale);
      shellRef.current.rotation.y = t * -0.1;
    }
  });

  const coreColor = preset === 'stellar-core' ? '#f59e0b' : preset === 'quantum-void' ? '#38bdf8' : '#00f2fe';
  const coronaColor = preset === 'stellar-core' ? '#ef4444' : preset === 'quantum-void' ? '#818cf8' : '#ec4899';

  return (
    <group>
      {/* Central Pulsating Star Core */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial
          color={coreColor}
          wireframe
          transparent
          opacity={0.85 * visualState.signalReliability}
        />
      </mesh>

      {/* Radiant Glowing Corona Shell */}
      <mesh ref={coronaRef}>
        <icosahedronGeometry args={[1.4, 3]} />
        <meshBasicMaterial
          color={coronaColor}
          wireframe
          transparent
          opacity={0.45 * visualState.effectiveBloomIntensity * visualState.signalReliability}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Atmospheric Breath Shell */}
      <mesh ref={shellRef}>
        <sphereGeometry args={[2.0, 24, 24]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={0.12 * visualState.signalReliability}
          wireframe
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Galaxy Particle Field */}
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
          size={0.16 * visualState.effectiveBloomIntensity}
          vertexColors
          transparent
          opacity={Math.max(0.2, 0.85 * visualState.signalReliability)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
