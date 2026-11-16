import React from 'react';
import {
  LayoutDashboard,
  Eye,
  Orbit,
  Flower2,
  Sparkles,
  BarChart2,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ActiveView } from '../../types/experiences';
import { clsx } from 'clsx';

interface SidebarProps {
  onOpenHelp: () => void;
  onOpenWalkthrough?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenHelp, onOpenWalkthrough }) => {
  const { activeView, setActiveView } = useAppStore();

  const navItems: { id: ActiveView; label: string; icon: React.ReactNode; shortcut: string }[] = [
    {
      id: 'dashboard',
      label: 'Main Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      shortcut: '1',
    },
    {
      id: 'live-sensing',
      label: 'Live Reticle',
      icon: <Eye className="w-5 h-5" />,
      shortcut: '2',
    },
    {
      id: 'pulse-universe',
      label: 'Heartbeat Universe',
      icon: <Orbit className="w-5 h-5" />,
      shortcut: '3',
    },
    {
      id: 'breathing-garden',
      label: 'Breathing Garden',
      icon: <Flower2 className="w-5 h-5" />,
      shortcut: '4',
    },
    {
      id: 'harmony',
      label: 'Harmony Mode',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      shortcut: 'H',
    },
    {
      id: 'interactive',
      label: 'Interactive Lab',
      icon: <Layers className="w-5 h-5" />,
      shortcut: '5',
    },
    {
      id: 'summary',
      label: 'Session Summary',
      icon: <BarChart2 className="w-5 h-5" />,
      shortcut: '6',
    },
    {
      id: 'settings',
      label: 'Privacy & Settings',
      icon: <ShieldCheck className="w-5 h-5" />,
      shortcut: '7',
    },
  ];

  return (
    <aside className="w-20 md:w-64 bg-midnight-950/90 border-r border-white/5 flex flex-col justify-between p-3 md:p-4 select-none shrink-0 transition-all duration-300">
      <div className="space-y-6">
        {/* PulseVerse Brand Logo */}
        <div className="flex items-center gap-3 px-1 md:px-2 pt-1 pb-2 border-b border-white/5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cosmic-cyan to-cosmic-violet flex items-center justify-center text-midnight-950 font-black shadow-glow-cyan shrink-0 animate-pulse-slow">
            <Activity className="w-5 h-5 text-midnight-950" />
          </div>
          <div className="hidden md:block overflow-hidden">
            <h1 className="font-display font-extrabold text-base tracking-wider text-white flex items-center gap-1.5">
              <span>PULSE</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cosmic-cyan to-cosmic-violet">
                VERSE
              </span>
            </h1>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight truncate">
              Your Body, Your Universe
            </p>
          </div>
        </div>

        {/* Navigation Category Label */}
        <div className="hidden md:block px-2">
          <p className="text-[10px] font-mono tracking-widest uppercase text-slate-500 font-semibold">
            EXPERIENCE PORTALS
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={clsx(
                  'w-full flex items-center justify-center md:justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative focus-visible:ring-2 focus-visible:ring-cosmic-cyan focus-visible:outline-none',
                  isActive
                    ? 'bg-gradient-to-r from-cosmic-cyan/15 to-cosmic-violet/15 text-white border border-cosmic-cyan/30 shadow-glow-cyan/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
              >
                {/* Active glow indicator on left */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-gradient-to-b from-cosmic-cyan to-cosmic-violet" />
                )}

                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'transition-colors duration-200 shrink-0',
                      isActive ? 'text-cosmic-cyan' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="hidden md:inline font-display font-medium tracking-wide text-xs">
                    {item.label}
                  </span>
                </div>

                <span
                  className={clsx(
                    'hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded border',
                    isActive
                      ? 'border-cosmic-cyan/40 text-cosmic-cyan bg-cosmic-cyan/10'
                      : 'border-white/10 text-slate-500 group-hover:text-slate-400 bg-white/5'
                  )}
                >
                  {item.shortcut}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Shortcuts, Walkthrough & Engine Readiness */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        {onOpenWalkthrough && (
          <button
            onClick={onOpenWalkthrough}
            className="w-full flex items-center justify-center md:justify-between px-2.5 py-2 rounded-xl text-xs text-cosmic-cyan hover:bg-cosmic-cyan/10 transition-colors group focus-visible:ring-2 focus-visible:ring-cosmic-cyan"
            title="Privacy Architecture & Onboarding Walkthrough"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cosmic-cyan shrink-0" />
              <span className="hidden md:inline font-semibold">Privacy Walkthrough</span>
            </div>
            <span className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded border border-cosmic-cyan/30 text-cosmic-cyan">
              Guide
            </span>
          </button>
        )}

        <button
          onClick={onOpenHelp}
          className="w-full flex items-center justify-center md:justify-between px-2.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors group focus-visible:ring-2 focus-visible:ring-cosmic-cyan"
          title="Keyboard Shortcuts & Help"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-cosmic-cyan shrink-0" />
            <span className="hidden md:inline">Shortcuts</span>
          </div>
          <span className="hidden md:inline text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 text-slate-500">
            ?
          </span>
        </button>

        <div className="hidden md:block px-3 py-2 bg-midnight-900/60 rounded-xl border border-white/5 text-[11px] text-slate-400 space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">SmartSpectra C ABI</span>
            <span className="text-cosmic-emerald font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">v3.5.0 Electron FFI Bridge</p>
        </div>
      </div>
    </aside>
  );
};
