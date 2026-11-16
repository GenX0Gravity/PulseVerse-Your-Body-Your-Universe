import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

interface HarmonyChamberProps {
  visualState: MappedVisualState;
  particleDensity?: 'low' | 'medium' | 'high';
}

export const HarmonyChamber: React.FC<HarmonyChamberProps> = ({
  visualState,
  particleDensity = 'medium',
}) => {
  const torusRef = useRef<THREE.Mesh | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const particleFieldRef = useRef<THREE.Points | null>(null);
  const outerRingsRef = useRef<THREE.Group | null>(null);

  const particleCount = useMemo(() => {
    switch (particleDensity) {
      case 'low': return 1200;
      case 'high': return 5000;
      default: return 2800;
    }
  }, [particleDensity]);

  const { positions, colors, originalPositions, orbitSpeeds } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const orig = new Float32Array(particleCount * 3);
    const cols = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Golden spiral double-torus particle flow
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const majorR = 5.0 + Math.random() * 4.5;
      const minorR = 1.6 + Math.random() * 1.8;

      const x = (majorR + minorR * Math.cos(v)) * Math.cos(u);
      const y = minorR * Math.sin(v) * 1.5;
      const z = (majorR + minorR * Math.cos(v)) * Math.sin(u);

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      orig[i * 3] = x;
      orig[i * 3 + 1] = y;
      orig[i * 3 + 2] = z;

      spd[i] = 0.5 + Math.random() * 1.2;

      // Color gradation: Cyan (Cardio) blending with Emerald/Violet (Respiration)
      const ratio = (u / (Math.PI * 2));
      cols[i * 3] = 0.1 + ratio * 0.8;
      cols[i * 3 + 1] = 0.95 - ratio * 0.4;
      cols[i * 3 + 2] = 0.85 + ratio * 0.15;
    }

    return {
      positions: pos,
      colors: cols,
      originalPositions: orig,
      orbitSpeeds: spd,
    };
  }, [particleCount]);

  useEffect(() => {
    return () => {
      if (torusRef.current) {
        torusRef.current.geometry.dispose();
        (torusRef.current.material as THREE.Material).dispose();
      }
      if (coreRef.current) {
        coreRef.current.geometry.dispose();
        (coreRef.current.material as THREE.Material).dispose();
      }
      if (particleFieldRef.current) {
        particleFieldRef.current.geometry.dispose();
        (particleFieldRef.current.material as THREE.Material).dispose();
      }
    };
  }, [particleCount]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const {
      pulsePace,
      breathPace,
      cardiacDeflection,
      breathExpansion,
      coherenceFactor,
      effectiveParticleSpeed,
      effectiveBloomIntensity,
      signalReliability,
      isReducedMotion,
    } = visualState;

    // 1. PULSE controls particle acceleration and shockwave vibration
    const pulseImpulse = cardiacDeflection * (isReducedMotion ? 0.12 : 0.45);

    // 2. BREATHING controls environmental dimensional expansion
    const envScale = 1.0 + breathExpansion * 0.22;

    // Torus animation
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.15 * pulsePace * effectiveParticleSpeed;
      torusRef.current.rotation.y = t * 0.25 * breathPace * effectiveParticleSpeed;
      torusRef.current.scale.set(envScale, envScale, envScale);

      const mat = torusRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        // Coherence shifts emissive color to radiant auroral luminescence
        mat.emissiveIntensity =
          (0.4 + coherenceFactor * 0.7 + pulseImpulse * 0.5) * effectiveBloomIntensity * signalReliability;
      }
    }

    // Central Heart-Breath Nucleus
    if (coreRef.current) {
      const coreScale = (1.1 + pulseImpulse * 0.6) * (1.0 + breathExpansion * 0.15);
      coreRef.current.scale.set(coreScale, coreScale, coreScale);
      coreRef.current.rotation.y = t * 0.5;
    }

    // Outer orbital rings
    if (outerRingsRef.current) {
      outerRingsRef.current.rotation.z = t * 0.08 * pulsePace;
      outerRingsRef.current.rotation.y = t * -0.12 * breathPace;
      const s = 1.0 + breathExpansion * 0.18;
      outerRingsRef.current.scale.set(s, s, s);
    }

    // Particles: Flow along torus, expanding with breath, surging with pulse
    if (particleFieldRef.current) {
      const posAttr = particleFieldRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;

      const flowSpeed = (0.3 + pulsePace * 0.4) * effectiveParticleSpeed;

      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const ox = originalPositions[i3];
        const oy = originalPositions[i3 + 1];
        const oz = originalPositions[i3 + 2];
        const spd = orbitSpeeds[i];

        // Rhythmic swirl
        const angle = t * flowSpeed * spd + i;
        const radiusMultiplier = (1.0 + pulseImpulse * 0.2) * envScale;

        arr[i3] = (ox * Math.cos(angle * 0.05) - oz * Math.sin(angle * 0.05)) * radiusMultiplier;
        arr[i3 + 1] = oy * radiusMultiplier + Math.sin(t * breathPace + i) * 0.15;
        arr[i3 + 2] = (ox * Math.sin(angle * 0.05) + oz * Math.cos(angle * 0.05)) * radiusMultiplier;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Central Pulsating Dual-Bio Nucleus */}
      <mesh ref={coreRef}>
        <dodecahedronGeometry args={[1.3, 2]} />
        <meshStandardMaterial
          color="#00f2fe"
          emissive="#7c3aed"
          emissiveIntensity={0.8}
          wireframe
          roughness={0.1}
        />
      </mesh>

      {/* Primary Sacred Geometry Harmonic Torus */}
      <mesh ref={torusRef}>
        <torusGeometry args={[5.2, 1.4, 24, 64]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#10b981"
          emissiveIntensity={0.5}
          wireframe
          transparent
          opacity={0.75 * visualState.signalReliability}
        />
      </mesh>

      {/* Outer Coherence Wave Rings */}
      <group ref={outerRingsRef}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <ringGeometry args={[7.8, 8.0, 64]} />
          <meshBasicMaterial
            color="#a855f7"
            transparent
            opacity={0.45 * visualState.signalReliability}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
          <ringGeometry args={[9.0, 9.2, 64]} />
          <meshBasicMaterial
            color="#06b6d4"
            transparent
            opacity={0.35 * visualState.signalReliability}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Dual Bio-Sensing Particle Vortex */}
      <points ref={particleFieldRef}>
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
          opacity={0.85 * visualState.signalReliability}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
};
