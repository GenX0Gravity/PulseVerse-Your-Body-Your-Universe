import React, { useState } from 'react';
import {
  Flower2,
  Sparkles,
  Compass,
  Clock,
  Flame,
  Shield,
} from 'lucide-react';
import { BreathingBloom } from '../components/visualizers/Interactive/BreathingBloom';
import { PulseConstellation } from '../components/visualizers/Interactive/PulseConstellation';
import { HarmonyQuest } from '../components/visualizers/Interactive/HarmonyQuest';
import { BioResonanceMandala } from '../components/visualizers/Interactive/BioResonanceMandala';
import { ChronoPulseClock } from '../components/visualizers/Interactive/ChronoPulseClock';
import { StressMeltdown } from '../components/visualizers/Interactive/StressMeltdown';
import { InteractiveMode } from '../types/experiences';

export const InteractiveExperiencesView: React.FC = () => {
  const [activeMode, setActiveMode] = useState<InteractiveMode>('breathing-bloom');

  const tabs: { id: InteractiveMode; label: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'breathing-bloom',
      label: 'Breathing Bloom',
      icon: <Flower2 className="w-4 h-4" />,
      color: 'from-emerald-400 to-teal-500 text-midnight-950 shadow-glow-emerald',
    },
    {
      id: 'pulse-constellation',
      label: 'Pulse Constellation',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-cosmic-cyan to-cosmic-teal text-midnight-950 shadow-glow-cyan',
    },
    {
      id: 'harmony-quest',
      label: 'Harmony Quest',
      icon: <Compass className="w-4 h-4" />,
      color: 'from-purple-500 to-cosmic-pink text-white shadow-glow-pink',
    },
    {
      id: 'bio-resonance',
      label: 'Sacred Mandala',
      icon: <Sparkles className="w-4 h-4" />,
      color: 'from-blue-500 to-indigo-600 text-white',
    },
    {
      id: 'chrono-pulse',
      label: 'Chrono-Clock',
      icon: <Clock className="w-4 h-4" />,
      color: 'from-rose-500 to-pink-600 text-white',
    },
    {
      id: 'stress-meltdown',
      label: 'Lattice Melt',
      icon: <Flame className="w-4 h-4" />,
      color: 'from-amber-500 to-orange-600 text-white',
    },
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col animate-fade-in select-none">
      {/* Experience Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between p-2 rounded-2xl bg-midnight-900/85 border border-white/10 shrink-0 gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {tabs.map((tab) => {
            const isActive = activeMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveMode(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-cosmic-cyan ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} font-bold`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 pr-2 text-xs font-mono text-slate-400">
          <Shield className="w-3.5 h-3.5 text-cosmic-emerald" />
          <span>Real-time Autonomic Biofeedback</span>
        </div>
      </div>

      {/* Selected Experience Canvas Container */}
      <div className="flex-1 w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative bg-midnight-950">
        {activeMode === 'breathing-bloom' && <BreathingBloom />}
        {activeMode === 'pulse-constellation' && <PulseConstellation />}
        {activeMode === 'harmony-quest' && <HarmonyQuest />}
        {activeMode === 'bio-resonance' && <BioResonanceMandala />}
        {activeMode === 'chrono-pulse' && <ChronoPulseClock />}
        {activeMode === 'stress-meltdown' && <StressMeltdown />}
      </div>
    </div>
  );
};
