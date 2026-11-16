import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  ChevronDown,
  ChevronUp,
  Heart,
  Wind,
  Square,
  Play,
  Maximize2,
  Minimize2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useSmartSpectra } from '../../hooks/useSmartSpectra';
import { useAppStore } from '../../store/useAppStore';
import { useVitalsStore } from '../../store/useVitalsStore';
import { AlignmentReticle } from './AlignmentReticle';

export const FloatingCameraHUD: React.FC = () => {
  const { stream, isRunning, validation } = useSmartSpectra();
  const { mode, isSessionActive, startSession, stopSession, activeView } = useAppStore();
  const { telemetry } = useVitalsStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Attach media stream to video element when expanded
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream, isExpanded]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Shortcut 'c' or 'C' toggles HUD expansion
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsExpanded((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Do not render HUD on Welcome or Consent screens, or on LiveSensingView (where full reticle is already active)
  if (activeView === 'welcome' || activeView === 'consent' || activeView === 'live-sensing') {
    return null;
  }

  const handleToggleFullScreen = async () => {
    if (window.pulseVerse?.toggleFullScreen) {
      const full = await window.pulseVerse.toggleFullScreen();
      setIsFullScreen(full);
    } else {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen().catch(() => {});
        setIsFullScreen(false);
      }
    }
  };

  return (
    <aside
      aria-label="Floating Camera & Biometric HUD"
      className="fixed bottom-4 right-4 z-40 select-none transition-all duration-300"
    >
      {isExpanded ? (
        /* Expanded Floating Camera Card */
        <div className="w-72 sm:w-80 rounded-2xl bg-midnight-950/90 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden p-3 space-y-3 animate-fade-in">
          {/* Header Bar */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-cosmic-cyan font-bold">
              <Camera className="w-3.5 h-3.5" />
              <span>OPTICAL SENSOR</span>
              {mode === 'demo' && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SIM
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleFullScreen}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen (F11)'}
              >
                {isFullScreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-cosmic-cyan" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Collapse to Biometric Pill (C)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video / Preview Box */}
          <div className="relative h-44 w-full rounded-xl bg-midnight-900 border border-white/10 overflow-hidden">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
                <Camera className="w-7 h-7 text-slate-500 mb-1 animate-pulse" />
                <p className="text-[11px] text-slate-400 font-mono">
                  {mode === 'demo' ? 'Synthetic Telemetry Running' : 'Camera Inactive'}
                </p>
              </div>
            )}

            {/* Reticle */}
            <AlignmentReticle active={isRunning || mode === 'demo'} />

            {/* Quality status badge */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded-lg bg-midnight-950/80 backdrop-blur-md border border-white/10 text-slate-300">
              <span className="flex items-center gap-1">
                {validation.isMeasurementReady ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                )}
                <span className="truncate max-w-[130px]">
                  {validation.isMeasurementReady ? 'Signal Locked' : validation.hint}
                </span>
              </span>
              <span className="text-cosmic-cyan font-bold">{telemetry.signalQuality}%</span>
            </div>
          </div>

          {/* Biometrics Strip */}
          <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[9px] text-slate-400 block">PULSE</span>
              <span className="text-xs font-bold text-cosmic-pink">
                {telemetry.pulseBpm ? `${telemetry.pulseBpm} BPM` : '--'}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[9px] text-slate-400 block">BREATH</span>
              <span className="text-xs font-bold text-cosmic-cyan">
                {telemetry.breathingBrpm ? `${telemetry.breathingBrpm} BrPM` : '--'}
              </span>
            </div>
            <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
              <span className="text-[9px] text-slate-400 block">RESONANCE</span>
              <span className="text-xs font-bold text-purple-300">{telemetry.coherenceScore}%</span>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={isSessionActive ? stopSession : startSession}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-mono text-xs font-bold transition-all shadow-md ${
                isSessionActive
                  ? 'bg-rose-500/80 hover:bg-rose-500 text-white'
                  : 'bg-cosmic-cyan/85 hover:bg-cosmic-cyan text-midnight-950 shadow-glow-cyan/50'
              }`}
            >
              {isSessionActive ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Pause Sensing</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Sensing</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Collapsed Biometric Pill in Corner */
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-midnight-950/85 backdrop-blur-xl border border-white/15 hover:border-cosmic-cyan/40 shadow-xl text-xs font-mono transition-all hover:scale-105 group"
          title="Open Floating Camera & Vitals HUD (Shortcut: C)"
        >
          {/* Pulsing indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSessionActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <Camera className="w-3.5 h-3.5 text-cosmic-cyan group-hover:rotate-12 transition-transform" />
          </div>

          {/* Live BPM and Breathing numbers */}
          <div className="flex items-center gap-2 border-l border-white/10 pl-2">
            <span className="flex items-center gap-1 text-cosmic-pink font-bold">
              <Heart className="w-3 h-3 fill-current animate-pulse-cardiac" />
              <span>{telemetry.pulseBpm || '--'}</span>
            </span>

            <span className="flex items-center gap-1 text-cosmic-cyan font-bold">
              <Wind className="w-3 h-3" />
              <span>{telemetry.breathingBrpm || '--'}</span>
            </span>
          </div>

          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white ml-0.5" />
        </button>
      )}
    </aside>
  );
};
