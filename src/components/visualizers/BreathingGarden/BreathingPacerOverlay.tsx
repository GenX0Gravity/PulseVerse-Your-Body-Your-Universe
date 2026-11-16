import React from 'react';
import { useVitalsStore } from '../../../store/useVitalsStore';
import { clsx } from 'clsx';

interface BreathingPacerOverlayProps {
  guidePattern?: '4-7-8' | 'coherence' | 'box';
}

export const BreathingPacerOverlay: React.FC<BreathingPacerOverlayProps> = ({
  guidePattern = 'coherence',
}) => {
  const { telemetry } = useVitalsStore();

  const isInhaling = telemetry.isBreathingIn;

  return (
    <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between pointer-events-none select-none">
      {/* Dynamic Visual Breathing Pacer */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-midnight-950/80 backdrop-blur-xl border border-white/10 pointer-events-auto shadow-glass-subtle">
        {/* Pulsing Guide Orb */}
        <div className="relative flex items-center justify-center w-16 h-16">
          <div
            className={clsx(
              'absolute rounded-full transition-all duration-1000 border-2',
              isInhaling
                ? 'w-14 h-14 bg-cosmic-cyan/20 border-cosmic-cyan shadow-glow-cyan'
                : 'w-8 h-8 bg-cosmic-violet/20 border-purple-400 shadow-glow-violet'
            )}
          />
          <span className="text-[11px] font-mono font-bold uppercase text-white z-10">
            {isInhaling ? 'Inhale' : 'Exhale'}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-wide">
              Resonant Biofeedback Pacer
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cosmic-cyan/15 text-cosmic-cyan border border-cosmic-cyan/30">
              {guidePattern === 'coherence' ? '5.5 BrPM Coherence' : 'Calming Breath'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronize your chest expansion with the bioluminescent garden petals.
          </p>
        </div>
      </div>

      {/* Live Respiratory Rate Meter */}
      <div className="p-4 rounded-2xl bg-midnight-950/80 backdrop-blur-xl border border-white/10 pointer-events-auto text-right shadow-glass-subtle font-mono">
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          Live Respiratory Cadence
        </span>
        <div className="text-2xl font-bold text-cosmic-cyan">
          {telemetry.breathingBrpm ? telemetry.breathingBrpm : '--'}{' '}
          <span className="text-xs font-normal text-slate-400">BrPM</span>
        </div>
      </div>
    </div>
  );
};
