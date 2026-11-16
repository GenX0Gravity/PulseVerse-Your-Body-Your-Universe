import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CosmicNebula } from './CosmicNebula';
import { StarField } from './StarField';
import { ShockwaveRing } from './ShockwaveRing';
import { MappedVisualState } from '../../../services/SignalVisualMapper';
import { PulseUniversePreset } from '../../../types/experiences';

interface PulseUniverseSceneProps {
  visualState: MappedVisualState;
  preset?: PulseUniversePreset;
  particleDensity?: 'low' | 'medium' | 'high';
  isPaused?: boolean;
}

export const PulseUniverseScene: React.FC<PulseUniverseSceneProps> = ({
  visualState,
  preset = 'supernova',
  particleDensity = 'medium',
  isPaused = false,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-midnight-950">
      <Canvas
        frameloop={isPaused ? 'never' : 'always'}
        camera={{ position: [0, 8, 22], fov: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#050813']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[0, 0, 0]} intensity={2.5 * visualState.signalReliability} color="#00f2fe" distance={30} />
        <pointLight position={[10, 15, 10]} intensity={1.2} color="#a855f7" />

        <Suspense fallback={null}>
          <StarField visualState={visualState} />
          <CosmicNebula
            visualState={visualState}
            preset={preset}
            particleDensity={particleDensity}
          />
          <ShockwaveRing visualState={visualState} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxDistance={45}
          minDistance={6}
          autoRotate={!visualState.isReducedMotion}
          autoRotateSpeed={0.35 * visualState.pulsePace}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Cinematic HUD vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(3,5,12,0.9)]" />
    </div>
  );
};
