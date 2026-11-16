import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { HarmonyChamber } from './HarmonyChamber';
import { StarField } from '../PulseUniverse/StarField';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

interface HarmonyWorldSceneProps {
  visualState: MappedVisualState;
  particleDensity?: 'low' | 'medium' | 'high';
  isPaused?: boolean;
}

export const HarmonyWorldScene: React.FC<HarmonyWorldSceneProps> = ({
  visualState,
  particleDensity = 'medium',
  isPaused = false,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-midnight-950">
      <Canvas
        frameloop={isPaused ? 'never' : 'always'}
        camera={{ position: [0, 9, 20], fov: 48 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#040714']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 0, 0]} intensity={3.0 * visualState.signalReliability} color="#00f2fe" distance={30} />
        <pointLight position={[12, 12, 8]} intensity={1.5} color="#a855f7" />
        <pointLight position={[-12, -8, -8]} intensity={1.2} color="#10b981" />

        <Suspense fallback={null}>
          <StarField visualState={visualState} />
          <HarmonyChamber visualState={visualState} particleDensity={particleDensity} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxDistance={40}
          minDistance={6}
          autoRotate={!visualState.isReducedMotion}
          autoRotateSpeed={0.3 * visualState.pulsePace}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Atmospheric Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(2,5,15,0.92)]" />
    </div>
  );
};
