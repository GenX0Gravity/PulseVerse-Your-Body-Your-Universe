import React, { useState, useEffect } from 'react';
import {
  Heart,
  Wind,
  Play,
  Square,
  Zap,
  Settings,
  CameraOff,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useVitalsStore } from '../../store/useVitalsStore';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../common/Button';
import { clsx } from 'clsx';
import { SmartSpectraService } from '../../services/SmartSpectraService';
import { AmbientSoundEngine } from '../../services/AmbientSoundEngine';

export const Header: React.FC = () => {
  const {
    isSessionActive,
    startSession,
    stopSession,
    mode,
    setMode,
    sessionStartTime,
    setActiveView,
    activeView,
  } = useAppStore();
  const { telemetry } = useVitalsStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sdkState, setSdkState] = useState<string>(() => SmartSpectraService.getInstance().getState());
  const [isCameraActive, setIsCameraActive] = useState<boolean>(() => Boolean(SmartSpectraService.getInstance().getMediaStream()));
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(() => AmbientSoundEngine.getInstance().getIsMuted());

  // Subscribe to SDK state & stream updates, fullscreen events, and audio mute events
  useEffect(() => {
    const service = SmartSpectraService.getInstance();
    const unsubState = service.onStateChange(setSdkState);
    const unsubStream = service.onStream((stream) => setIsCameraActive(Boolean(stream)));
    const unsubMute = AmbientSoundEngine.getInstance().onMuteChange(setIsAudioMuted);

    let unsubFs: (() => void) | undefined;
    if (window.pulseVerse?.onFullScreenChange) {
      unsubFs = window.pulseVerse.onFullScreenChange((full) => setIsFullScreen(full));
    }
    const handleBrowserFs = () => setIsFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleBrowserFs);

    return () => {
      unsubState();
      unsubStream();
      unsubMute();
      if (unsubFs) unsubFs();
      document.removeEventListener('fullscreenchange', handleBrowserFs);
    };
  }, []);

  const handleToggleAudio = () => {
    const next = AmbientSoundEngine.getInstance().toggleMute();
    setIsAudioMuted(next);
  };

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

  // Session elapsed timer
  useEffect(() => {
    let interval: number | null = null;
    if (isSessionActive && sessionStartTime) {
      interval = window.setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - sessionStartTime) / 1000));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSessionActive, sessionStartTime]);

  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleToggleSession = () => {
    if (isSessionActive) {
      const finishedSession = stopSession();
      if (finishedSession) {
        setActiveView('summary');
      }
    } else {
      startSession();
    }
  };

  const getSdkStatusBadge = () => {
    if (mode === 'demo') {
      return (
        <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          SIMULATED
        </span>
      );
    }

    switch (sdkState) {
      case 'measuring':
        return (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE RPPG
          </span>
        );
      case 'initializing':
      case 'requestingPermission':
        return (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cosmic-cyan/15 border border-cosmic-cyan/30 text-cosmic-cyan font-mono text-[11px] font-semibold animate-pulse">
            CONNECTING...
          </span>
        );
      case 'insufficientSignal':
        return (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-semibold">
            CALIBRATING...
          </span>
        );
      case 'error':
        return (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono text-[11px] font-semibold">
            ATTENTION
          </span>
        );
      default:
        return (
          <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 font-mono text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            STANDBY
          </span>
        );
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 bg-midnight-950/80 border-b border-white/5 flex items-center justify-between select-none shrink-0 z-20">
      {/* Real-time telemetry pills & Status indicators */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Pulse Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-900/80 border border-white/10 shadow-sm" role="status" aria-label="Pulse Rate">
          <Heart
            className={clsx(
              'w-4 h-4 text-cosmic-pink',
              isSessionActive && telemetry.pulseBpm && 'animate-pulse-cardiac'
            )}
          />
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm md:text-base font-bold text-white">
              {telemetry.pulseBpm && telemetry.pulseBpm > 0
                ? telemetry.pulseBpm
                : isSessionActive
                ? 'Calibrating...'
                : '--'}
            </span>
            {telemetry.pulseBpm && telemetry.pulseBpm > 0 && (
              <span className="text-[10px] font-mono text-slate-400">BPM</span>
            )}
          </div>
        </div>

        {/* Breathing Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-900/80 border border-white/10 shadow-sm" role="status" aria-label="Breathing Rate">
          <Wind
            className={clsx(
              'w-4 h-4 text-cosmic-cyan',
              isSessionActive && telemetry.breathingBrpm && 'animate-breathe-slow'
            )}
          />
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm md:text-base font-bold text-white">
              {telemetry.breathingBrpm && telemetry.breathingBrpm > 0
                ? telemetry.breathingBrpm
                : isSessionActive
                ? 'Calibrating...'
                : '--'}
            </span>
            {telemetry.breathingBrpm && telemetry.breathingBrpm > 0 && (
              <span className="text-[10px] font-mono text-slate-400">BrPM</span>
            )}
          </div>
        </div>

        {/* Coherence Pill (hidden on small viewports) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-midnight-900/80 border border-white/10 shadow-sm" role="status" aria-label="Cardiopulmonary Synchrony">
          <Zap className="w-4 h-4 text-purple-400" />
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-bold text-white">
              {isSessionActive ? `${telemetry.coherenceScore}%` : '--'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Coherence</span>
          </div>
        </div>

        {/* Dynamic SDK & Mode Badge */}
        {getSdkStatusBadge()}

        {/* Hardware Camera Active Indicator Pill */}
        <div
          className={clsx(
            'hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all',
            isCameraActive
              ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              : 'bg-white/5 border-white/10 text-slate-500'
          )}
          title={isCameraActive ? 'Camera hardware stream active' : 'Camera hardware idle'}
        >
          {isCameraActive ? (
            <>
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>CAM ACTIVE</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3 h-3 text-slate-500" />
              <span>CAM OFF</span>
            </>
          )}
        </div>
      </div>

      {/* Controls & Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mode Selector Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-midnight-900/90 border border-white/10" role="group" aria-label="Sensing Mode">
          <button
            onClick={() => setMode('live')}
            className={clsx(
              'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cosmic-cyan',
              mode === 'live'
                ? 'bg-cosmic-cyan text-midnight-950 shadow-glow-cyan'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Live Camera
          </button>
          <button
            onClick={() => setMode('demo')}
            className={clsx(
              'px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-cosmic-violet',
              mode === 'demo'
                ? 'bg-cosmic-violet text-white shadow-glow-violet'
                : 'text-slate-400 hover:text-white'
            )}
          >
            Demo Mode
          </button>
        </div>

        {/* Active Session Elapsed Timer */}
        {isSessionActive && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-midnight-900/90 border border-cosmic-cyan/30 text-xs font-mono text-cosmic-cyan">
            <span className="w-2 h-2 rounded-full bg-cosmic-cyan animate-ping" />
            <span className="font-bold">{formatDuration(elapsedSeconds)}</span>
          </div>
        )}

        {/* Start / End Session Primary Button */}
        <Button
          variant={isSessionActive ? 'danger' : 'primary'}
          size="sm"
          onClick={handleToggleSession}
          icon={isSessionActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        >
          {isSessionActive ? 'Stop Camera' : 'Start Sensing'}
        </Button>

        {/* Settings Quick Access Icon Button */}
        <button
          onClick={() => setActiveView('settings')}
          className={clsx(
            'p-2 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-cosmic-cyan',
            activeView === 'settings'
              ? 'bg-cosmic-cyan/20 border-cosmic-cyan/40 text-cosmic-cyan'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          )}
          title="Privacy & Settings (7)"
          aria-label="Open Privacy and Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Fullscreen Quick Toggle */}
        <button
          onClick={handleToggleFullScreen}
          className="p-2 rounded-xl border bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all focus-visible:ring-2 focus-visible:ring-cosmic-cyan"
          title={isFullScreen ? 'Exit Full Screen (F11 or Esc)' : 'Enter Full Screen (F11)'}
          aria-label="Toggle Full Screen"
        >
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4 text-cosmic-cyan" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>

        {/* Ambient Soothing Soundscape Button */}
        <button
          onClick={handleToggleAudio}
          className={clsx(
            'p-2 rounded-xl border transition-all focus-visible:ring-2 focus-visible:ring-purple-400',
            !isAudioMuted
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-glow-violet'
              : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          )}
          title={!isAudioMuted ? 'Mute Soothing Ambient Music (432Hz)' : 'Play Calm Meditative Music (432Hz)'}
          aria-label={!isAudioMuted ? 'Mute Ambient Music' : 'Play Ambient Music'}
        >
          {!isAudioMuted ? (
            <Volume2 className="w-4 h-4 text-purple-300 animate-pulse-slow" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Dark / Light Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};
