import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

export type GardenTheme = 'moonlight' | 'twilight' | 'amber';

interface BioluminescentFloraProps {
  visualState: MappedVisualState;
  theme?: GardenTheme;
}

export const BioluminescentFlora: React.FC<BioluminescentFloraProps> = ({
  visualState,
  theme = 'moonlight',
}) => {
  const outerPetalsRef = useRef<THREE.Group | null>(null);
  const innerPetalsRef = useRef<THREE.Group | null>(null);
  const pistilRef = useRef<THREE.Mesh | null>(null);
  const waterRef = useRef<THREE.Mesh | null>(null);

  const petalCount = 8;

  // Theme palettes
  const palette = {
    moonlight: {
      pistilEmissive: '#00f2fe',
      pistilColor: '#10b981',
      outerColor: '#14b8a6',
      outerEmissive: '#8a2be2',
      innerColor: '#06b6d4',
      innerEmissive: '#10b981',
      waterColor: '#050c18',
    },
    twilight: {
      pistilEmissive: '#f43f5e',
      pistilColor: '#8b5cf6',
      outerColor: '#a855f7',
      outerEmissive: '#ec4899',
      innerColor: '#d946ef',
      innerEmissive: '#6366f1',
      waterColor: '#0a0518',
    },
    amber: {
      pistilEmissive: '#f59e0b',
      pistilColor: '#ea580c',
      outerColor: '#f97316',
      outerEmissive: '#eab308',
      innerColor: '#fbbf24',
      innerEmissive: '#f97316',
      waterColor: '#120b05',
    },
  }[theme];

  useEffect(() => {
    return () => {
      if (pistilRef.current) {
        pistilRef.current.geometry.dispose();
        (pistilRef.current.material as THREE.Material).dispose();
      }
      if (waterRef.current) {
        waterRef.current.geometry.dispose();
        (waterRef.current.material as THREE.Material).dispose();
      }
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const {
      normalizedBreath,
      breathExpansion,
      breathPace,
      effectiveBloomIntensity,
      signalReliability,
      isReducedMotion,
    } = visualState;

    // Gentle ambient sway paced by respiration
    const sway = Math.sin(t * 0.8 * breathPace) * 0.04;

    // Outer Petals: Bloom outward on inhalation
    if (outerPetalsRef.current) {
      outerPetalsRef.current.children.forEach((child, i) => {
        const angle = (i * Math.PI * 2) / petalCount;
        const unfurlAngle = 0.32 + normalizedBreath * (isReducedMotion ? 0.22 : 0.48);
        child.rotation.x = Math.sin(angle) * unfurlAngle + sway;
        child.rotation.z = Math.cos(angle) * unfurlAngle + sway;

        const s = 1.0 + normalizedBreath * 0.22;
        child.scale.set(s, s, s);
      });
    }

    // Inner Petals: Open with slight phase offset
    if (innerPetalsRef.current) {
      innerPetalsRef.current.children.forEach((child, i) => {
        const angle = (i * Math.PI * 2) / petalCount + Math.PI / petalCount;
        const innerUnfurl = 0.2 + normalizedBreath * (isReducedMotion ? 0.18 : 0.38);
        child.rotation.x = Math.sin(angle) * innerUnfurl;
        child.rotation.z = Math.cos(angle) * innerUnfurl;

        const s = 0.85 + normalizedBreath * 0.25;
        child.scale.set(s, s, s);
      });
      innerPetalsRef.current.rotation.y = t * 0.05 * breathPace;
    }

    // Central Glowing Pistil: Pulsates and glows brighter as chest expands
    if (pistilRef.current) {
      const pScale = 0.75 + normalizedBreath * 0.35;
      pistilRef.current.scale.set(pScale, pScale, pScale);
      const mat = pistilRef.current.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.emissiveIntensity =
          (0.6 + normalizedBreath * 0.8) * effectiveBloomIntensity * signalReliability;
      }
    }

    // Water Surface: Gentle ripple on breathing
    if (waterRef.current) {
      waterRef.current.position.y = -0.05 + breathExpansion * 0.03;
    }
  });

  return (
    <group position={[0, -1.4, 0]}>
      {/* Central Glowing Pistil Core */}
      <mesh ref={pistilRef} position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial
          color={palette.pistilColor}
          emissive={palette.pistilEmissive}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Outer Lotus Petals Array */}
      <group ref={outerPetalsRef}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (i * Math.PI * 2) / petalCount;
          return (
            <group key={`outer-${i}`} rotation={[0, angle, 0]}>
              <mesh position={[0, 1.25, 1.45]} rotation={[0.42, 0, 0]}>
                <coneGeometry args={[0.58, 2.6, 16]} />
                <meshStandardMaterial
                  color={palette.outerColor}
                  emissive={palette.outerEmissive}
                  emissiveIntensity={0.55 * visualState.effectiveBloomIntensity}
                  roughness={0.28}
                  transparent
                  opacity={0.88 * visualState.signalReliability}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Inner Delicate Petals Array */}
      <group ref={innerPetalsRef}>
        {Array.from({ length: petalCount }).map((_, i) => {
          const angle = (i * Math.PI * 2) / petalCount;
          return (
            <group key={`inner-${i}`} rotation={[0, angle, 0]}>
              <mesh position={[0, 0.95, 0.95]} rotation={[0.25, 0, 0]}>
                <coneGeometry args={[0.42, 1.8, 16]} />
                <meshStandardMaterial
                  color={palette.innerColor}
                  emissive={palette.innerEmissive}
                  emissiveIntensity={0.7 * visualState.effectiveBloomIntensity}
                  roughness={0.2}
                  transparent
                  opacity={0.92 * visualState.signalReliability}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Floating Zen Lily Pads */}
      {Array.from({ length: 6 }).map((_, i) => {
        const padAngle = (i * Math.PI * 2) / 6 + 0.3;
        const padDist = 3.6 + (i % 2) * 1.2;
        return (
          <mesh
            key={`pad-${i}`}
            rotation={[-Math.PI / 2, 0, padAngle]}
            position={[Math.cos(padAngle) * padDist, 0.02, Math.sin(padAngle) * padDist]}
          >
            <circleGeometry args={[1.1, 32, 0, Math.PI * 1.85]} />
            <meshStandardMaterial
              color="#064e3b"
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        );
      })}

      {/* Ethereal Water Mirror Reflection Disk */}
      <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial
          color={palette.waterColor}
          roughness={0.08}
          metalness={0.92}
        />
      </mesh>
    </group>
  );
};
