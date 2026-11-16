import React from 'react';
import {
  Camera,
  Cpu,
  Activity,
  Shield,
  Sparkles,
  AlertOctagon,
  Sun,
  Move,
  Users,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { CameraPreview } from '../components/camera/CameraPreview';
import { SignalQualityMeter } from '../components/camera/SignalQualityMeter';
import { WaveformCanvas } from '../components/common/WaveformCanvas';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { useVitalsStore } from '../store/useVitalsStore';
import { useAppStore } from '../store/useAppStore';
import { useCamera } from '../hooks/useCamera';
import { useSmartSpectra } from '../hooks/useSmartSpectra';

export const LiveSensingView: React.FC = () => {
  const { telemetry } = useVitalsStore();
  const { isSessionActive, startSession, stopSession, mode, setMode } = useAppStore();
  const { devices, selectedDeviceId, setSelectedDeviceId } = useCamera();
  const { state, validation, error } = useSmartSpectra();

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">
              Live Optical Sensing Reticle
            </h2>
            <Badge variant={mode === 'live' ? 'cyan' : 'amber'} pulse={isSessionActive}>
              {mode === 'live' ? 'Active Sensor' : 'SIMULATED DATA'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical vitals extraction via Presage SmartSpectra remote photoplethysmography (rPPG).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setMode(mode === 'live' ? 'demo' : 'live')}
          >
            Switch to {mode === 'live' ? 'Demo Mode' : 'Live Camera'}
          </Button>

          <Button
            size="sm"
            variant={isSessionActive ? 'danger' : 'primary'}
            onClick={isSessionActive ? stopSession : startSession}
          >
            {isSessionActive ? 'Pause Sensing' : 'Start Sensing (Space)'}
          </Button>
        </div>
      </div>

      {/* Error Alert Box with Recovery Instructions */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 shadow-glow-pink space-y-2 animate-fade-in">
          <div className="flex items-center gap-2.5 text-rose-300 font-bold text-sm">
            <AlertOctagon className="w-5 h-5" />
            <span>Sensor Issue: {error.message}</span>
          </div>
          <p className="text-xs text-slate-200 pl-7 leading-relaxed font-sans">
            <strong className="text-white">Recommended Action:</strong> {error.recoveryGuidance}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Camera Feed & Reticle (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <GlassCard variant="default" className="p-4 relative">
            <div className="h-[420px] w-full relative">
              <CameraPreview showReticle={true} className="h-full w-full" />
            </div>

            {/* Bottom Camera Toolbar */}
            <div className="flex items-center justify-between pt-4 text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-cosmic-cyan" />
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="bg-midnight-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cosmic-cyan"
                >
                  {devices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label}
                    </option>
                  ))}
                  {devices.length === 0 && <option value="">Default Webcam</option>}
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>State: <strong className="text-cosmic-cyan uppercase">{state}</strong></span>
              </div>
            </div>
          </GlassCard>

          {/* Real-time Oscilloscope Traces */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassCard variant="default" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cosmic-pink flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  Arterial Pulse Trace
                </span>
                <span className="text-slate-400 font-bold">
                  {telemetry.pulseBpm && telemetry.pulseBpm > 0
                    ? `${telemetry.pulseBpm} BPM`
                    : isSessionActive
                    ? 'Calibrating...'
                    : '--'}
                </span>
              </div>
              <WaveformCanvas data={telemetry.pulseWaveform} color="pink" height={85} />
            </GlassCard>

            <GlassCard variant="default" className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cosmic-cyan flex items-center gap-1.5 font-bold">
                  <Activity className="w-3.5 h-3.5" />
                  Respiratory Trace
                </span>
                <span className="text-slate-400 font-bold">
                  {telemetry.breathingBrpm && telemetry.breathingBrpm > 0
                    ? `${telemetry.breathingBrpm} BrPM`
                    : isSessionActive
                    ? 'Calibrating...'
                    : '--'}
                </span>
              </div>
              <WaveformCanvas data={telemetry.breathingWaveform} color="cyan" height={85} />
            </GlassCard>
          </div>
        </div>

        {/* Right: Signal Diagnostics, Validation Feedback & Guide (1 col) */}
        <div className="space-y-4">
          <SignalQualityMeter />

          {/* Measurement Readiness & Optical Quality Feedback */}
          <GlassCard variant="glow-violet" className="p-5 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                Measurement Readiness
              </h4>
              {validation.isMeasurementReady ? (
                <span className="flex items-center gap-1 text-[11px] text-cosmic-emerald font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              ) : (
                <span className="text-[11px] text-amber-400 font-bold">Adjusting</span>
              )}
            </div>

            <div className="space-y-2 text-slate-300">
              {/* Lighting check */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Lighting:
                </span>
                <span
                  className={
                    validation.lightingStatus === 'optimal'
                      ? 'text-cosmic-emerald'
                      : 'text-amber-400'
                  }
                >
                  {validation.lightingStatus === 'optimal'
                    ? 'Optimal'
                    : validation.lightingStatus === 'too_dark'
                    ? 'Too Dark'
                    : 'Too Bright'}
                </span>
              </div>

              {/* Motion check */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Move className="w-3.5 h-3.5 text-cosmic-cyan" /> Stability:
                </span>
                <span
                  className={
                    validation.motionStatus === 'stable'
                      ? 'text-cosmic-emerald'
                      : 'text-rose-400'
                  }
                >
                  {validation.motionStatus === 'stable' ? 'Stable' : 'Excessive Motion'}
                </span>
              </div>

              {/* Face position check */}
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Maximize2 className="w-3.5 h-3.5 text-purple-400" /> Alignment:
                </span>
                <span
                  className={
                    validation.facePositionStatus === 'centered'
                      ? 'text-cosmic-emerald'
                      : 'text-amber-400'
                  }
                >
                  {validation.facePositionStatus === 'centered'
                    ? 'Centered'
                    : validation.facePositionStatus === 'too_close'
                    ? 'Too Close'
                    : validation.facePositionStatus === 'too_far'
                    ? 'Too Far'
                    : validation.facePositionStatus === 'multiple'
                    ? 'Multiple Faces'
                    : 'Searching Face'}
                </span>
              </div>

              {/* Single face verification */}
              <div className="flex items-center justify-between py-1.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> Participant:
                </span>
                <span className="text-cosmic-cyan">Single Subject</span>
              </div>
            </div>
          </GlassCard>

          {/* Validation Hint Banner */}
          <GlassCard variant="subtle" className="p-4 space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Guidance Reticle Hint
            </div>
            <p className="text-xs text-white font-medium leading-relaxed">
              {validation.hint || telemetry.trackingHint}
            </p>
          </GlassCard>

          {/* Privacy Guarantee */}
          <GlassCard variant="subtle" className="p-4 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Shield className="w-4 h-4 text-cosmic-emerald" />
              <span>Zero-Cloud Optical Architecture</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Video frames are passed strictly in RAM to the local SmartSpectra C ABI shim. No images are ever recorded or transmitted.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
