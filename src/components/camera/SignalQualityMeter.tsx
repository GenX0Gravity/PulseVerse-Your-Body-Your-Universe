import React from 'react';
import { Gauge } from 'lucide-react';
import { useVitalsStore } from '../../store/useVitalsStore';
import { GlassCard } from '../common/GlassCard';

export const SignalQualityMeter: React.FC = () => {
  const { telemetry } = useVitalsStore();

  const getQualityLabel = (val: number) => {
    if (val >= 80) return { text: 'Optimal', color: 'text-cosmic-emerald' };
    if (val >= 50) return { text: 'Moderate', color: 'text-amber-400' };
    if (val > 0) return { text: 'Low Light / Motion', color: 'text-rose-400' };
    return { text: 'Standby', color: 'text-slate-400' };
  };

  const status = getQualityLabel(telemetry.signalQuality);

  return (
    <GlassCard variant="subtle" className="p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400 flex items-center gap-1.5">
          <Gauge className="w-3.5 h-3.5 text-cosmic-cyan" />
          Signal Stability
        </span>
        <span className={`font-bold ${status.color}`}>{status.text}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-midnight-950 overflow-hidden border border-white/5 relative">
        <div
          className="h-full bg-gradient-to-r from-cosmic-violet via-cosmic-cyan to-cosmic-emerald transition-all duration-300 rounded-full"
          style={{ width: `${telemetry.signalQuality}%` }}
        />
      </div>

      {/* Diagnostic telemetry stats */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase">FPS</div>
          <div className="text-xs font-bold text-slate-200">{telemetry.fps}</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase">Latency</div>
          <div className="text-xs font-bold text-slate-200">{telemetry.latencyMs}ms</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase">Confidence</div>
          <div className="text-xs font-bold text-slate-200">{telemetry.signalQuality}%</div>
        </div>
      </div>
    </GlassCard>
  );
};
