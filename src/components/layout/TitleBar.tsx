import React, { useState, useEffect } from 'react';
import { Minus, Square, X, Activity, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { Badge } from '../common/Badge';

export const TitleBar: React.FC = () => {
  const { mode, isSessionActive } = useAppStore();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    async function checkMaximized() {
      if (window.pulseVerse?.isMaximized) {
        const max = await window.pulseVerse.isMaximized();
        setIsMaximized(max);
      }
    }
    checkMaximized();
  }, []);

  const handleMinimize = () => window.pulseVerse?.minimize();
  const handleMaximize = async () => {
    if (window.pulseVerse?.maximize) {
      const max = await window.pulseVerse.maximize();
      setIsMaximized(max);
    }
  };
  const handleClose = () => window.pulseVerse?.close();

  return (
    <div className="h-10 w-full bg-midnight-950/90 border-b border-white/5 flex items-center justify-between px-4 select-none z-50 relative app-drag-region">
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
          <Badge
            variant="cyan"
            size="sm"
            pulse={isSessionActive}
          >
            Live Sensor
          </Badge>
        )}
      </div>

      {/* Center status message */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-cosmic-cyan animate-pulse-slow" />
        <span>Your Body, Your Universe</span>
      </div>

      {/* Window Controls (Native electron window operations) */}
      <div className="flex items-center gap-1 no-drag">
        <button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Minimize"
          aria-label="Minimize window"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title={isMaximized ? 'Restore' : 'Maximize'}
          aria-label="Maximize window"
        >
          <Square className="w-3 h-3" />
        </button>
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
