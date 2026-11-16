import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Activity, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Badge } from '../common/Badge';

export const TitleBar: React.FC = () => {
  const { mode, isSessionActive } = useAppStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    async function checkWindowState() {
      if (window.pulseVerse?.isMaximized) {
        const max = await window.pulseVerse.isMaximized();
        setIsMaximized(max);
      }
      if (window.pulseVerse?.isFullScreen) {
        const full = await window.pulseVerse.isFullScreen();
        setIsFullScreen(full);
      }
    }
    checkWindowState();

    // Listen to Electron IPC fullscreen events if available
    let cleanupIpc: (() => void) | undefined;
    if (window.pulseVerse?.onFullScreenChange) {
      cleanupIpc = window.pulseVerse.onFullScreenChange((full) => {
        setIsFullScreen(full);
      });
    }

    // Also listen to standard browser fullscreenchange
    const handleBrowserFullscreen = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleBrowserFullscreen);

    return () => {
      if (cleanupIpc) cleanupIpc();
      document.removeEventListener('fullscreenchange', handleBrowserFullscreen);
    };
  }, []);

  const handleMinimize = () => window.pulseVerse?.minimize();

  const handleMaximize = async () => {
    if (window.pulseVerse?.maximize) {
      const max = await window.pulseVerse.maximize();
      setIsMaximized(max);
    }
  };

  const handleToggleFullScreen = async () => {
    if (window.pulseVerse?.toggleFullScreen) {
      const full = await window.pulseVerse.toggleFullScreen();
      setIsFullScreen(full);
    } else {
      // Browser fallback
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen().catch(() => {});
        setIsFullScreen(false);
      }
    }
  };

  const handleClose = () => window.pulseVerse?.close();

  return (
    <div
      onDoubleClick={handleMaximize}
      className="h-10 w-full bg-midnight-950/95 border-b border-white/5 flex items-center justify-between px-4 select-none z-50 relative app-drag-region backdrop-blur-md"
    >
      {/* Brand & Mode */}
      <div className="flex items-center gap-3 no-drag">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-tr from-cosmic-cyan to-cosmic-violet flex items-center justify-center shadow-glow-cyan/50">
            <Activity className="w-3.5 h-3.5 text-midnight-950 font-black" />
          </div>
          <span className="font-display font-bold text-sm tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            PULSE<span className="text-cosmic-cyan font-black">VERSE</span>
          </span>
        </div>

        <div className="h-3 w-[1px] bg-white/10" />

        {mode === 'demo' ? (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold tracking-wider animate-pulse">
            SIMULATED DATA
          </span>
        ) : (
          <Badge variant="cyan" size="sm" pulse={isSessionActive}>
            Live Sensor
          </Badge>
        )}
      </div>

      {/* Center status message */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-cosmic-cyan animate-pulse-slow" />
        <span>Your Body, Your Universe</span>
      </div>

      {/* Window Controls (Native electron window operations + Fullscreen toggle) */}
      <div className="flex items-center gap-1 no-drag">
        {/* Fullscreen Button */}
        <button
          onClick={handleToggleFullScreen}
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
            isFullScreen
              ? 'text-cosmic-cyan bg-cosmic-cyan/15 hover:bg-cosmic-cyan/25'
              : 'text-slate-400 hover:text-white hover:bg-white/10'
          }`}
          title={isFullScreen ? 'Exit Full Screen (F11 or Esc)' : 'Enter Full Screen (F11)'}
          aria-label={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen'}
        >
          {isFullScreen ? (
            <Minimize2 className="w-3.5 h-3.5 text-cosmic-cyan" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Minimize Button */}
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize"
          aria-label="Minimize window"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore Button */}
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
          aria-label="Maximize window"
        >
          <Square className="w-3 h-3" />
        </button>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/80 transition-colors"
          title="Close"
          aria-label="Close window"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
