import React, { useState } from 'react';
import {
  Heart,
  Wind,
  Zap,
  Activity,
  Orbit,
  Flower2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Maximize2,
  Layers,
  Square,
  Play,
  Camera,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useVitalsStore } from '../store/useVitalsStore';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WaveformCanvas } from '../components/common/WaveformCanvas';
import { CameraPreview } from '../components/camera/CameraPreview';
import { HarmonyChamber } from '../components/visualizers/Harmony/HarmonyChamber';
import { Canvas } from '@react-three/fiber';
import { SignalVisualMapper } from '../services/SignalVisualMapper';

export const DashboardView: React.FC = () => {
  const { setActiveView, isSessionActive, startSession, stopSession, mode, setMode } = useAppStore();
  const { telemetry } = useVitalsStore();
  const [showCamera, setShowCamera] = useState(true);

  const isLowSignal = isSessionActive && telemetry.signalQuality < 30;

  // Single-frame mapped visual state for the hero preview
  const mapper = React.useMemo(() => new SignalVisualMapper(), []);
  const visualState = mapper.update({
    pulseBpm: telemetry.pulseBpm,
    pulseConfidence: telemetry.pulseBpm ? telemetry.signalQuality : null,
    breathingBrpm: telemetry.breathingBrpm,
    breathingConfidence: telemetry.breathingBrpm ? telemetry.signalQuality : null,
    arterialWaveformSample: telemetry.pulseWaveform[telemetry.pulseWaveform.length - 1] ?? null,
    chestWaveformSample: telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] ?? null,
    signalQuality: telemetry.signalQuality,
    isCalibrating: !telemetry.pulseBpm || telemetry.signalQuality < 30,
    timestampMs: Date.now(),
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-8">
      {/* Prominent Demo Mode Banner */}
      {mode === 'demo' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 shadow-glow-amber flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 font-black shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/40">
                  SIMULATED DATA ACTIVE
                </span>
                <span className="text-sm font-bold text-white">Visual-Only Demo Mode</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Physiological readings are synthetically generated. Real camera sensing is disabled.
              </p>
            </div>
          </div>
          <Button size="sm" variant="glow-cyan" onClick={() => setMode('live')}>
            Switch to Live Camera
          </Button>
        </div>
      )}

      {/* Hero Visualizer & Camera Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Large Immersive Hero Preview (8 cols on lg) */}
        <GlassCard
          variant="glow-cyan"
          className="lg:col-span-7 xl:col-span-8 p-0 flex flex-col justify-between overflow-hidden min-h-[360px] relative group"
        >
          {/* Live 3D Scene Canvas Background */}
          <div className="absolute inset-0 bg-midnight-950">
            <Canvas camera={{ position: [0, 7, 18], fov: 48 }} gl={{ antialias: true }}>
              <color attach="background" args={['#040714']} />
              <ambientLight intensity={0.6} />
              <pointLight position={[0, 0, 0]} intensity={2.5 * visualState.signalReliability} color="#00f2fe" />
              <pointLight position={[10, 10, 10]} intensity={1.2} color="#a855f7" />
              <HarmonyChamber visualState={visualState} particleDensity="low" />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-t from-midnight-950 via-midnight-950/30 to-transparent pointer-events-none" />
          </div>

          {/* Top Overlay Badge & Scene Switcher */}
          <div className="relative p-5 flex items-center justify-between z-10 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-950/80 backdrop-blur-md border border-white/10 pointer-events-auto">
              <Sparkles className="w-4 h-4 text-cosmic-cyan animate-spin-slow" />
              <span className="font-display font-bold text-xs text-white">Live Bio-Resonance Preview</span>
            </div>

            <Button
              size="sm"
              variant="glow-cyan"
              onClick={() => setActiveView('harmony')}
              icon={<Maximize2 className="w-3.5 h-3.5" />}
              iconPosition="right"
              className="pointer-events-auto"
            >
              Enter Immersive Fullscreen
            </Button>
          </div>

          {/* Bottom Hero Overlay Information */}
          <div className="relative p-5 z-10 space-y-2 pointer-events-none">
            <div className="flex flex-wrap items-center gap-3">
              <div className="px-3 py-1 rounded-lg bg-midnight-950/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
                Pulse Velocity: <strong className="text-cosmic-pink">{telemetry.pulseBpm ? `${telemetry.pulseBpm} BPM` : '72 BPM'}</strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-midnight-950/85 backdrop-blur-md border border-white/10 text-xs font-mono text-slate-300">
                Thoracic Breath: <strong className="text-emerald-300">{telemetry.breathingBrpm ? `${telemetry.breathingBrpm} BrPM` : '14 BrPM'}</strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-midnight-950/85 backdrop-blur-md border border-white/10 text-xs font-mono text-purple-300">
                Synchrony: <strong>{telemetry.coherenceScore}%</strong>
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-lg">
              Real-time physiological signals drive particle acceleration and dimensional geometry expansion simultaneously.
            </p>
          </div>
        </GlassCard>

        {/* Camera Preview & Sensor Reticle Card (4-5 cols on lg) */}
        <GlassCard variant="default" className="lg:col-span-5 xl:col-span-4 p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-cosmic-cyan" />
              <h3 className="font-display font-bold text-sm text-white">Contactless Optical Sensor</h3>
            </div>
            <button
              onClick={() => setShowCamera(!showCamera)}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
            >
              {showCamera ? 'Hide Feed' : 'Show Feed'}
            </button>
          </div>

          {/* Live Camera View Box */}
          <div className="h-56 w-full rounded-2xl overflow-hidden border border-white/10 relative">
            {showCamera ? (
              <CameraPreview className="h-full w-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-midnight-950 text-slate-500 text-xs font-mono">
                <Camera className="w-8 h-8 mb-2 text-slate-600" />
                <span>Camera feed collapsed</span>
              </div>
            )}
          </div>

          {/* Sensor Quality & Guidance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Sensor Quality</span>
              <span className={telemetry.signalQuality >= 40 ? 'text-cosmic-emerald font-bold' : 'text-amber-400 font-bold'}>
                {telemetry.signalQuality}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  telemetry.signalQuality >= 60 ? 'bg-emerald-400' : telemetry.signalQuality >= 30 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${Math.max(5, telemetry.signalQuality)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {telemetry.trackingHint || 'Position face within reticle under even lighting.'}
            </p>
          </div>

          {/* Start / Stop Sensing Button */}
          <Button
            size="md"
            variant={isSessionActive ? 'danger' : 'primary'}
            onClick={isSessionActive ? stopSession : startSession}
            icon={isSessionActive ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4" />}
            className="w-full"
          >
            {isSessionActive ? 'Stop Sensing Session (Space)' : 'Start Sensing Session (Space)'}
          </Button>
        </GlassCard>
      </div>

      {/* Primary 4 Vital Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Vital Telemetry Overview">
        {/* Pulse Rate */}
        <GlassCard variant="glow-pink" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-cosmic-pink" />
              Pulse Rate
            </span>
            <Badge variant="pink" size="sm" pulse={isSessionActive && Boolean(telemetry.pulseBpm)}>
              {mode === 'demo' ? 'SIMULATED' : 'rPPG'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {telemetry.pulseBpm && telemetry.pulseBpm > 0 ? (
              <>
                <span className="text-4xl font-mono font-extrabold text-white">
                  {telemetry.pulseBpm}
                </span>
                <span className="text-xs font-mono text-slate-400">BPM</span>
              </>
            ) : isSessionActive ? (
              <span className="text-base font-mono font-bold text-cosmic-pink animate-pulse">
                {isLowSignal ? 'Signal unavailable' : 'Calibrating...'}
              </span>
            ) : (
              <span className="text-4xl font-mono font-extrabold text-slate-500">--</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {telemetry.pulseBpm
              ? 'Real-time contactless rPPG cardiac rate'
              : isSessionActive
              ? 'Accumulating optical pulse windows...'
              : 'Awaiting sensor activation'}
          </p>
        </GlassCard>

        {/* Breathing Rate */}
        <GlassCard variant="glow-cyan" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cosmic-cyan" />
              Breathing Rate
            </span>
            <Badge variant="cyan" size="sm" pulse={isSessionActive && Boolean(telemetry.breathingBrpm)}>
              {mode === 'demo' ? 'SIMULATED' : 'Thoracic'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {telemetry.breathingBrpm && telemetry.breathingBrpm > 0 ? (
              <>
                <span className="text-4xl font-mono font-extrabold text-white">
                  {telemetry.breathingBrpm}
                </span>
                <span className="text-xs font-mono text-slate-400">BrPM</span>
              </>
            ) : isSessionActive ? (
              <span className="text-base font-mono font-bold text-cosmic-cyan animate-pulse">
                {isLowSignal ? 'Signal unavailable' : 'Calibrating...'}
              </span>
            ) : (
              <span className="text-4xl font-mono font-extrabold text-slate-500">--</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {telemetry.breathingBrpm
              ? telemetry.isBreathingIn
                ? 'Phase: Inhalation (Expanding)'
                : 'Phase: Exhalation (Relaxing)'
              : isSessionActive
              ? 'Detecting thoracic displacement...'
              : 'Awaiting sensor activation'}
          </p>
        </GlassCard>

        {/* HRV RMSSD */}
        <GlassCard variant="glow-violet" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              HRV (RMSSD)
            </span>
            <Badge variant="violet" size="sm">
              {telemetry.hrvRmssd ? 'Ready' : 'Window 60s'}
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {telemetry.hrvRmssd && telemetry.hrvRmssd > 0 ? (
              <>
                <span className="text-4xl font-mono font-extrabold text-white">
                  {Math.round(telemetry.hrvRmssd)}
                </span>
                <span className="text-xs font-mono text-slate-400">ms</span>
              </>
            ) : isSessionActive ? (
              <span className="text-base font-mono font-semibold text-purple-300">
                Calibrating...
              </span>
            ) : (
              <span className="text-4xl font-mono font-extrabold text-slate-500">--</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {telemetry.hrvRmssd
              ? 'Heart rate variability parasympathetic tone'
              : isSessionActive
              ? 'Requires mandatory 60s window'
              : 'Awaiting sensor activation'}
          </p>
        </GlassCard>

        {/* Coherence / Synchrony Score */}
        <GlassCard variant="subtle" className="p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cosmic-emerald" />
              Resonance Coherence
            </span>
            <Badge variant="emerald" size="sm">
              Biofeedback
            </Badge>
          </div>
          <div className="flex items-baseline gap-2">
            {isSessionActive ? (
              <>
                <span className="text-4xl font-mono font-extrabold text-white">
                  {telemetry.coherenceScore}
                </span>
                <span className="text-xs font-mono text-slate-400">%</span>
              </>
            ) : (
              <span className="text-4xl font-mono font-extrabold text-slate-500">--</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {isSessionActive
              ? 'Cardiopulmonary synchronization index'
              : 'Awaiting sensor activation'}
          </p>
        </GlassCard>
      </div>

      {/* Dual Real-Time Oscilloscope Waveforms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard variant="default" className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cosmic-pink animate-pulse" />
              Arterial Pressure Waveform (rPPG Pulse)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {mode === 'demo' ? 'Dicrotic Model' : 'Sub-dermal micro-vascular'}
            </span>
          </div>
          <WaveformCanvas
            data={telemetry.pulseWaveform}
            color="pink"
            height={110}
            label={
              mode === 'demo'
                ? 'SIMULATED WAVEFORM (Dicrotic Notch Model)'
                : 'ARTERIAL_PRESSURE_TRACE (Micro-vascular pulse)'
            }
          />
        </GlassCard>

        <GlassCard variant="default" className="p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-pulse" />
              Thoracic Respiratory Trace (Inhale / Exhale)
            </span>
            <span className="text-slate-400 font-mono text-[11px]">
              {mode === 'demo' ? 'Synthetic Model' : 'Thoracic Kinematics'}
            </span>
          </div>
          <WaveformCanvas
            data={telemetry.breathingWaveform}
            color="cyan"
            height={110}
            label={
              mode === 'demo'
                ? 'SIMULATED WAVEFORM (Sinusoidal Respiration)'
                : 'CHEST_BREATHING (Optical displacement)'
            }
          />
        </GlassCard>
      </div>

      {/* 3D Immersive Realms Portals */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-display font-bold text-white tracking-wide">
            Interactive Biofeedback Realms
          </h3>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Directly mapped to live optical signals
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Portal: Pulse Universe */}
          <GlassCard variant="glow-cyan" hoverEffect className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cosmic-cyan/15 border border-cosmic-cyan/30 flex items-center justify-center text-cosmic-cyan shadow-glow-cyan">
                <Orbit className="w-5 h-5" />
              </div>
              <h4 className="text-base font-display font-bold text-white">Heartbeat Universe</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Interactive 3D cosmological star nebula pulsing with your real cardiovascular cadence and emitting gravitational shockwaves.
              </p>
            </div>
            <Button
              size="sm"
              variant="glow-cyan"
              onClick={() => setActiveView('pulse-universe')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Enter Universe (3)
            </Button>
          </GlassCard>

          {/* Portal: Breathing Garden */}
          <GlassCard variant="glow-emerald" hoverEffect className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                <Flower2 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-display font-bold text-white">Breathing Garden</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                A serene bioluminescent garden whose lotus petals and ascending spore clouds breathe in direct synchrony with your lungs.
              </p>
            </div>
            <Button
              size="sm"
              variant="glow-emerald"
              onClick={() => setActiveView('breathing-garden')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Enter Garden (4)
            </Button>
          </GlassCard>

          {/* Portal: Harmony World */}
          <GlassCard variant="glow-pink" hoverEffect className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-cosmic-pink/20 border border-cosmic-pink/40 flex items-center justify-center text-pink-300 shadow-glow-pink">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="text-base font-display font-bold text-white">Harmony World</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fused pulse and breathing worlds. Heart rates accelerate energetic particle flows while respiration drives cosmic dimensional expansion.
              </p>
            </div>
            <Button
              size="sm"
              variant="glow-pink"
              onClick={() => setActiveView('harmony')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Enter Harmony (H)
            </Button>
          </GlassCard>

          {/* Portal: Interactive Lab */}
          <GlassCard variant="subtle" hoverEffect className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-display font-bold text-white">Bio-Resonance Lab</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explore sacred geometric mandalas, kinetic chronometers, and stress melting particle lattices driven by autonomic biofeedback.
              </p>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveView('interactive')}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Explore Lab (5)
            </Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
