import React, { useEffect } from 'react';
import {
  BarChart2,
  Heart,
  Wind,
  Zap,
  Clock,
  Download,
  Trash2,
  Calendar,
  Play,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const SessionSummaryView: React.FC = () => {
  const { currentSession, startSession, setActiveView } = useAppStore();
  const { savedSessions, refreshSessionsFromDisk, purgeAllLocalData } = useSettingsStore();

  useEffect(() => {
    refreshSessionsFromDisk();
  }, [refreshSessionsFromDisk]);

  const activeData = currentSession || savedSessions[0] || {
    id: 'demo_session',
    startTime: Date.now() - 360000,
    endTime: Date.now(),
    durationSeconds: 360,
    mode: 'live',
    avgPulseBpm: 71,
    minPulseBpm: 64,
    maxPulseBpm: 82,
    avgBreathingBrpm: 13.5,
    avgCoherenceScore: 82,
    pulseHistory: [],
    breathingHistory: [],
    coherenceHistory: [],
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulseverse_session_${activeData.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">
              Session Analytics & Biometrics
            </h2>
            <Badge variant={activeData.mode === 'live' ? 'cyan' : 'violet'}>
              {activeData.mode === 'live' ? 'Live Telemetry' : 'Demo Record'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Session ID: {activeData.id} • {new Date(activeData.startTime).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportJson}
            icon={<Download className="w-4 h-4" />}
          >
            Export JSON Report
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              startSession();
              setActiveView('dashboard');
            }}
            icon={<Play className="w-4 h-4" />}
          >
            Start New Session
          </Button>
        </div>
      </div>

      {/* 4 Summary Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard variant="glow-pink" className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-cosmic-pink" />
              Average Pulse
            </span>
            <span className="text-slate-500">{activeData.minPulseBpm}-{activeData.maxPulseBpm}</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {activeData.avgPulseBpm} <span className="text-xs font-normal text-slate-400">BPM</span>
          </div>
          <p className="text-[11px] text-slate-400">Optimal resting cardiovascular range</p>
        </GlassCard>

        <GlassCard variant="glow-cyan" className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cosmic-cyan" />
              Average Respiration
            </span>
            <span className="text-slate-500">Steady</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {activeData.avgBreathingBrpm} <span className="text-xs font-normal text-slate-400">BrPM</span>
          </div>
          <p className="text-[11px] text-slate-400">Deep resonant diaphragmatic breathing</p>
        </GlassCard>

        <GlassCard variant="glow-violet" className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              Autonomic Harmony
            </span>
            <span className="text-emerald-400">High</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {activeData.avgCoherenceScore}%
          </div>
          <p className="text-[11px] text-slate-400">Respiratory sinus arrhythmia coherence</p>
        </GlassCard>

        <GlassCard variant="subtle" className="p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cosmic-emerald" />
              Session Duration
            </span>
            <span className="text-slate-500">Total</span>
          </div>
          <div className="text-3xl font-mono font-bold text-white">
            {formatDuration(activeData.durationSeconds)}
          </div>
          <p className="text-[11px] text-slate-400">Stored locally in AppData</p>
        </GlassCard>
      </div>

      {/* Physiological Insights Breakdown */}
      <GlassCard variant="default" className="p-6 space-y-4">
        <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-cosmic-cyan" />
          Physiological Assessment & Observations
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-midnight-950/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-cosmic-pink">Cardiovascular Stability</h4>
            <p className="leading-relaxed">
              Pulse variance remained within a tight band between {activeData.minPulseBpm} and {activeData.maxPulseBpm} BPM, signaling healthy baroreflex sensitivity without sudden tachycardia spikes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight-950/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-cosmic-cyan">Respiratory Regularity</h4>
            <p className="leading-relaxed">
              Breathing frequency hovered near {activeData.avgBreathingBrpm} BrPM with smooth transition phases, matching the optimal range for parasympathetic activation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-midnight-950/60 border border-white/5 space-y-2">
            <h4 className="font-bold text-purple-300">Coherence State</h4>
            <p className="leading-relaxed">
              With an average coherence of {activeData.avgCoherenceScore}%, your heart rate modulated in harmony with inhalation and exhalation (Respiratory Sinus Arrhythmia).
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Local Historical Sessions Archive */}
      <GlassCard variant="default" className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Local Encrypted Session History ({savedSessions.length})
          </h3>

          {savedSessions.length > 0 && (
            <button
              onClick={purgeAllLocalData}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Purge History
            </button>
          )}
        </div>

        {savedSessions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center font-mono">
            No previous sessions recorded yet. Completed sessions will appear here locally.
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {savedSessions.map((s) => (
              <div
                key={s.id}
                className="py-3 flex items-center justify-between text-xs hover:bg-white/5 px-2 rounded-lg transition-colors font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {new Date(s.startTime).toLocaleDateString()} {new Date(s.startTime).toLocaleTimeString()}
                  </span>
                  <Badge variant={s.mode === 'live' ? 'cyan' : 'violet'} size="sm">
                    {s.mode}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-slate-300">
                  <span>Pulse: <strong className="text-white">{s.avgPulseBpm} BPM</strong></span>
                  <span>Coherence: <strong className="text-cosmic-cyan">{s.avgCoherenceScore}%</strong></span>
                  <span>Duration: {formatDuration(s.durationSeconds)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
