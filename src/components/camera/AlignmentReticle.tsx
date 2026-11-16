import React from 'react';
import { useVitalsStore } from '../../store/useVitalsStore';
import { clsx } from 'clsx';

interface AlignmentReticleProps {
  active: boolean;
}

export const AlignmentReticle: React.FC<AlignmentReticleProps> = ({ active }) => {
  const { telemetry } = useVitalsStore();

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6 select-none">
      {/* Face guide ellipse / frame */}
      <div
        className={clsx(
          'w-56 h-72 rounded-[45%] border-2 border-dashed transition-all duration-500 relative flex items-center justify-center',
          active && telemetry.isFaceDetected
            ? 'border-cosmic-cyan/60 shadow-[0_0_30px_rgba(0,242,254,0.25)]'
            : active
            ? 'border-amber-400/50 animate-pulse'
            : 'border-white/10'
        )}
      >
        {/* Corner alignment markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cosmic-cyan -translate-x-2 -translate-y-2" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cosmic-cyan translate-x-2 -translate-y-2" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cosmic-cyan -translate-x-2 translate-y-2" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cosmic-cyan translate-x-2 translate-y-2" />

        {/* Center eye-level horizontal guideline */}
        <div className="w-12 h-[1px] bg-cosmic-cyan/40" />

        {/* Signal feedback hint banner */}
        <div className="absolute -bottom-10 whitespace-nowrap px-3 py-1 rounded-full bg-midnight-950/85 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-200">
          {telemetry.trackingHint}
        </div>
      </div>
    </div>
  );
};
