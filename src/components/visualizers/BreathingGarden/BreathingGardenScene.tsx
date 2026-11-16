import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { BioluminescentFlora, GardenTheme } from './BioluminescentFlora';
import { SporeCloud } from './SporeCloud';
import { MappedVisualState } from '../../../services/SignalVisualMapper';

interface BreathingGardenSceneProps {
  visualState: MappedVisualState;
  theme?: GardenTheme;
  particleDensity?: 'low' | 'medium' | 'high';
  isPaused?: boolean;
}

export const BreathingGardenScene: React.FC<BreathingGardenSceneProps> = ({
  visualState,
  theme = 'moonlight',
  particleDensity = 'medium',
  isPaused = false,
}) => {
  const lightColor = theme === 'twilight' ? '#c084fc' : theme === 'amber' ? '#f59e0b' : '#34d399';
  const ambientColor = theme === 'twilight' ? '#3b0764' : theme === 'amber' ? '#451a03' : '#064e3b';

  return (
    <div className="w-full h-full relative overflow-hidden bg-midnight-950">
      <Canvas
        frameloop={isPaused ? 'never' : 'always'}
        camera={{ position: [0, 5, 14], fov: 45 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        className="cursor-grab active:cursor-grabbing"
      >
        <color attach="background" args={['#040812']} />
        <ambientLight intensity={0.5} color={ambientColor} />
        <directionalLight position={[5, 12, 5]} intensity={1.2} color={lightColor} />
        <pointLight
          position={[0, 1.2, 0]}
          intensity={2.8 * visualState.signalReliability}
          color={lightColor}
          distance={15}
        />

        <Suspense fallback={null}>
          <BioluminescentFlora visualState={visualState} theme={theme} />
          <SporeCloud visualState={visualState} theme={theme} density={particleDensity} />
        </Suspense>

        <OrbitControls
          enableZoom={true}
          maxDistance={28}
          minDistance={5}
          maxPolarAngle={Math.PI / 2.05} // Keep above pond horizon
          autoRotate={!visualState.isReducedMotion}
          autoRotateSpeed={0.25 * visualState.breathPace}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(3,6,15,0.88)]" />
    </div>
  );
};
