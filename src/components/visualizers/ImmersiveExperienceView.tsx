import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Sliders,
  Heart,
  Wind,
  Orbit,
  Flower2,
  Sparkles,
  X,
  Gauge,
  HelpCircle,
} from 'lucide-react';
import { PulseUniverseScene } from './PulseUniverse/PulseUniverseScene';
import { BreathingGardenScene } from './BreathingGarden/BreathingGardenScene';
import { HarmonyWorldScene } from './Harmony/HarmonyWorldScene';
import { SignalVisualMapper, MappedVisualState, RawTelemetrySnapshot } from '../../services/SignalVisualMapper';
import { AmbientSoundEngine } from '../../services/AmbientSoundEngine';
import { useVitalsStore } from '../../store/useVitalsStore';
import { useAppStore } from '../../store/useAppStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { PulseUniversePreset } from '../../types/experiences';
import { GardenTheme } from './BreathingGarden/BioluminescentFlora';

export type ExperienceSceneId = 'pulse-universe' | 'breathing-garden' | 'harmony-world';

interface ImmersiveExperienceViewProps {
  initialScene?: ExperienceSceneId;
  onExit?: () => void;
}

export const ImmersiveExperienceView: React.FC<ImmersiveExperienceViewProps> = ({
  initialScene = 'pulse-universe',
  onExit,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // App & Telemetry Stores
  const { mode } = useAppStore();
  const { telemetry } = useVitalsStore();
  const { experienceSettings } = useSettingsStore();

  const defaultDensity: 'low' | 'medium' | 'high' =
    experienceSettings.particleDensity === 'low'
      ? 'low'
      : experienceSettings.particleDensity === 'high'
      ? 'high'
      : 'medium';

  // Experience Controls State
  const [activeScene, setActiveScene] = useState<ExperienceSceneId>(initialScene);
  const [universePreset, setUniversePreset] = useState<PulseUniversePreset>('supernova');
  const [gardenTheme, setGardenTheme] = useState<GardenTheme>('moonlight');

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [visualIntensity, setVisualIntensity] = useState(1.0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [particleDensity, setParticleDensity] = useState<'low' | 'medium' | 'high'>(defaultDensity);
  const [showControlsDrawer, setShowControlsDrawer] = useState(false);
  const [isTabVisible, setIsTabVisible] = useState(!document.hidden);

  // Signal Visual Mapper instance
  const mapper = useMemo(() => new SignalVisualMapper({
    reducedMotion,
    visualIntensity,
  }), []);

  const [visualState, setVisualState] = useState<MappedVisualState>(() =>
    mapper.update({
      pulseBpm: telemetry.pulseBpm,
      pulseConfidence: telemetry.pulseBpm ? telemetry.signalQuality : null,
      breathingBrpm: telemetry.breathingBrpm,
      breathingConfidence: telemetry.breathingBrpm ? telemetry.signalQuality : null,
      arterialWaveformSample: telemetry.pulseWaveform[telemetry.pulseWaveform.length - 1] ?? null,
      chestWaveformSample: telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] ?? null,
      signalQuality: telemetry.signalQuality,
      isCalibrating: !telemetry.pulseBpm || telemetry.signalQuality < 30,
      timestampMs: Date.now(),
    })
  );

  // Keep mapper options updated
  useEffect(() => {
    mapper.setOptions({ reducedMotion, visualIntensity });
  }, [mapper, reducedMotion, visualIntensity]);

  // Tab visibility listener (pause animation & audio when backgrounded)
  useEffect(() => {
    const handleVisibility = () => {
      const visible = !document.hidden;
      setIsTabVisible(visible);
      if (!visible) {
        AmbientSoundEngine.getInstance().setMuted(true);
      } else if (!isMuted) {
        AmbientSoundEngine.getInstance().setMuted(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isMuted]);

  // High-frequency animation update loop
  useEffect(() => {
    let animId: number;
    const sound = AmbientSoundEngine.getInstance();

    const loop = () => {
      const latestArterial = telemetry.pulseWaveform[telemetry.pulseWaveform.length - 1] ?? null;
      const latestChest = telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] ?? null;

      const rawSnapshot: RawTelemetrySnapshot = {
        pulseBpm: telemetry.pulseBpm,
        pulseConfidence: telemetry.pulseBpm ? telemetry.signalQuality : null,
        breathingBrpm: telemetry.breathingBrpm,
        breathingConfidence: telemetry.breathingBrpm ? telemetry.signalQuality : null,
        arterialWaveformSample: latestArterial,
        chestWaveformSample: latestChest,
        signalQuality: telemetry.signalQuality,
        isCalibrating: !telemetry.pulseBpm || telemetry.signalQuality < 30,
        timestampMs: Date.now(),
      };

      const mapped = mapper.update(rawSnapshot);
      setVisualState(mapped);

      // Modulate sound if unmuted
      if (!isMuted && isTabVisible) {
        sound.updatePhysiology(
          mapped.cardiacDeflection,
          mapped.normalizedBreath,
          mapped.coherenceFactor
        );
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [mapper, telemetry, isMuted, isTabVisible]);

  // Fullscreen Handler
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard Shortcuts in Immersive View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 's' || e.key === 'S') {
        const sound = AmbientSoundEngine.getInstance();
        const nextMuted = sound.toggleMute();
        setIsMuted(nextMuted);
      } else if (e.key === '1') {
        setActiveScene('pulse-universe');
      } else if (e.key === '2') {
        setActiveScene('breathing-garden');
      } else if (e.key === '3') {
        setActiveScene('harmony-world');
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (onExit) {
          onExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onExit]);

  // Sound Engine Toggle
  const toggleSound = () => {
    const sound = AmbientSoundEngine.getInstance();
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    AmbientSoundEngine.getInstance().setVolume(newVol);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[calc(100vh-140px)] rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-midnight-950 select-none animate-fade-in ${
        isFullscreen ? '!h-screen !w-screen !rounded-none !border-none fixed inset-0 z-50' : ''
      }`}
    >
      {/* 3D WebGL Scene Switching */}
      <div className="w-full h-full absolute inset-0">
        {activeScene === 'pulse-universe' && (
          <PulseUniverseScene
            visualState={visualState}
            preset={universePreset}
            particleDensity={particleDensity}
            isPaused={!isTabVisible}
          />
        )}
        {activeScene === 'breathing-garden' && (
          <BreathingGardenScene
            visualState={visualState}
            theme={gardenTheme}
            particleDensity={particleDensity}
            isPaused={!isTabVisible}
          />
        )}
        {activeScene === 'harmony-world' && (
          <HarmonyWorldScene
            visualState={visualState}
            particleDensity={particleDensity}
            isPaused={!isTabVisible}
          />
        )}
      </div>

      {/* Top Floating Glass HUD Bar */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between pointer-events-none z-30">
        {/* Scene Selector */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-midnight-950/85 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
          <button
            onClick={() => setActiveScene('pulse-universe')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScene === 'pulse-universe'
                ? 'bg-gradient-to-r from-cosmic-cyan to-cosmic-teal text-midnight-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>Heartbeat Universe</span>
          </button>

          <button
            onClick={() => setActiveScene('breathing-garden')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScene === 'breathing-garden'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-midnight-950 shadow-glow-emerald'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flower2 className="w-3.5 h-3.5" />
            <span>Breathing Garden</span>
          </button>

          <button
            onClick={() => setActiveScene('harmony-world')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeScene === 'harmony-world'
                ? 'bg-gradient-to-r from-purple-500 to-cosmic-pink text-white shadow-glow-pink'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Harmony World</span>
          </button>
        </div>

        {/* Live Signal Telemetry HUD Badge */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-midnight-950/85 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-auto">
          {/* Mode / Calibration Indicator */}
          {mode === 'demo' ? (
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider">
              SIMULATED DATA
            </span>
          ) : visualState.isCalibrating ? (
            <span className="px-2.5 py-0.5 rounded-full bg-cosmic-cyan/20 text-cosmic-cyan border border-cosmic-cyan/40 text-[10px] font-mono font-semibold animate-pulse">
              CALIBRATING...
            </span>
          ) : visualState.isSignalStale ? (
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-semibold">
              SIGNAL FADED
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY
            </span>
          )}

          {/* Pulse Telemetry */}
          <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 text-xs font-mono">
            <Heart
              className="w-3.5 h-3.5 text-cosmic-pink"
              style={{
                transform: `scale(${1 + visualState.cardiacDeflection * 0.4})`,
                transition: 'transform 0.05s ease-out',
              }}
            />
            <span className="font-bold text-white">
              {telemetry.pulseBpm ? `${telemetry.pulseBpm} BPM` : '72 BPM'}
            </span>
          </div>

          {/* Breathing Telemetry */}
          <div className="flex items-center gap-1.5 pl-1 pr-2 border-r border-white/10 text-xs font-mono">
            <Wind
              className="w-3.5 h-3.5 text-emerald-400"
              style={{
                transform: `scale(${1 + visualState.normalizedBreath * 0.35})`,
                transition: 'transform 0.1s ease-out',
              }}
            />
            <span className="font-bold text-white">
              {telemetry.breathingBrpm ? `${telemetry.breathingBrpm} BrPM` : '14 BrPM'}
            </span>
          </div>

          {/* Cardiopulmonary Synchrony */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-purple-300 pr-1">
            <Gauge className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-bold">
              {Math.round(visualState.coherenceFactor * 100)}% Synchrony
            </span>
          </div>
        </div>

        {/* Action Controls (Sound, Settings Drawer, Fullscreen, Exit) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all ${
              !isMuted
                ? 'bg-cosmic-cyan/20 border-cosmic-cyan/40 text-cosmic-cyan shadow-glow-cyan'
                : 'bg-midnight-950/85 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title={isMuted ? 'Unmute Ambient Synthesizer (S)' : 'Mute Ambient Synthesizer (S)'}
          >
            {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Visual Settings Drawer Button */}
          <button
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className={`p-2.5 rounded-2xl backdrop-blur-xl border transition-all ${
              showControlsDrawer
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-midnight-950/85 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
            title="Adjust Visual & Performance Parameters"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-midnight-950/85 backdrop-blur-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Enter Fullscreen (F)'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Exit View Button (if provided) */}
          {onExit && (
            <button
              onClick={onExit}
              className="p-2.5 rounded-2xl bg-midnight-950/85 backdrop-blur-xl border border-white/10 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="Exit Immersive Experience (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Settings Drawer */}
      {showControlsDrawer && (
        <div className="absolute top-20 right-5 w-80 p-5 rounded-3xl bg-midnight-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-4 z-40 text-xs animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <span className="font-display font-bold text-white text-sm">Visual & Signal Engine</span>
            <button
              onClick={() => setShowControlsDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scene-Specific Sub-Themes */}
          {activeScene === 'pulse-universe' && (
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">Universe Color Palette</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['supernova', 'quantum-void', 'stellar-core'] as PulseUniversePreset[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setUniversePreset(p)}
                    className={`py-1.5 px-2 rounded-xl capitalize font-medium transition-all ${
                      universePreset === p
                        ? 'bg-cosmic-cyan text-midnight-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {p.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeScene === 'breathing-garden' && (
            <div className="space-y-1.5">
              <label className="text-slate-400 font-semibold">Garden Flora Theme</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['moonlight', 'twilight', 'amber'] as GardenTheme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setGardenTheme(t)}
                    className={`py-1.5 px-2 rounded-xl capitalize font-medium transition-all ${
                      gardenTheme === t
                        ? 'bg-emerald-400 text-midnight-950 font-bold'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visual Intensity Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-slate-400">
              <span>Visual Intensity</span>
              <span className="font-mono text-cosmic-cyan">{Math.round(visualIntensity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={visualIntensity}
              onChange={(e) => setVisualIntensity(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cosmic-cyan"
            />
          </div>

          {/* Sound Volume Slider */}
          {!isMuted && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Ambient Volume</span>
                <span className="font-mono text-emerald-400">{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          )}

          {/* Particle Density / Performance Tier */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold">Particle Density (GPU Optimization)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['low', 'medium', 'high'] as const).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setParticleDensity(tier)}
                  className={`py-1.5 px-2 rounded-xl capitalize font-medium transition-all ${
                    particleDensity === tier
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Reduced Motion</span>
              <span className="text-[11px] text-slate-400">Dampen shockwaves and velocity</span>
            </div>
            <button
              onClick={() => setReducedMotion(!reducedMotion)}
              className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center ${
                reducedMotion ? 'bg-cosmic-cyan justify-end' : 'bg-white/15 justify-start'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full transition-transform ${
                  reducedMotion ? 'bg-midnight-950' : 'bg-white'
                }`}
              />
            </button>
          </div>

          {/* Non-Diagnostic Disclaimer Note */}
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] text-slate-400 flex items-start gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-cosmic-cyan shrink-0 mt-0.5" />
            <span>
              PulseVerse provides artistic biofeedback representations. Readings are not intended to diagnose medical conditions or stress levels.
            </span>
          </div>
        </div>
      )}

      {/* Subtle Bottom Guidance Toast */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none text-[11px] text-slate-400 font-mono flex items-center gap-3 bg-midnight-950/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/5">
        <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">1</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">2</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">3</kbd> to switch worlds</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">F</kbd> Fullscreen</span>
        <span>•</span>
        <span><kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white">S</kbd> Sound</span>
      </div>
    </div>
  );
};
