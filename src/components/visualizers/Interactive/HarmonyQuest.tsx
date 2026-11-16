import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Play,
  Pause,
  Waves,
  Sun,
  Trees,
} from 'lucide-react';
import { useVitalsStore } from '../../../store/useVitalsStore';

interface BiomeInfo {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  accent: string;
  bgGrad: string;
  icon: React.ReactNode;
}

export const HarmonyQuest: React.FC = () => {
  const { telemetry } = useVitalsStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [discoveredBiomes, setDiscoveredBiomes] = useState<Set<string>>(new Set(['celestial-grove']));
  const [activeBiomeId, setActiveBiomeId] = useState<string>('celestial-grove');
  const [showExplanation, setShowExplanation] = useState(false);

  // Biomes definitions — purely descriptive and exploratory, ZERO "good/bad" or "healthy/unhealthy" judgments!
  const biomes: Record<string, BiomeInfo> = {
    'celestial-grove': {
      id: 'celestial-grove',
      name: 'Celestial Grove',
      subtitle: 'Gentle Resting Rhythm Realm',
      description: 'Quiet nocturnal mosses and crystalline canopy responding to relaxed, resting cardiovascular cadences.',
      accent: '#10b981',
      bgGrad: 'radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, rgba(4, 7, 20, 0.95) 100%)',
      icon: <Trees className="w-5 h-5 text-emerald-400" />,
    },
    'solar-nexus': {
      id: 'solar-nexus',
      name: 'Solar Flare Nexus',
      subtitle: 'Dynamic Energy Realm',
      description: 'Energetic solar ribbons and radiant amber coronal loops triggered during heightened heart rates.',
      accent: '#f59e0b',
      bgGrad: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, rgba(4, 7, 20, 0.95) 100%)',
      icon: <Sun className="w-5 h-5 text-amber-400" />,
    },
    'deep-oceanic': {
      id: 'deep-oceanic',
      name: 'Deep Tidal Abyss',
      subtitle: 'Slow Respiratory Expanse',
      description: 'Luminescent abyssal hydro-creatures drifting slowly through deep blue swells when breathing slows.',
      accent: '#06b6d4',
      bgGrad: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.15) 0%, rgba(4, 7, 20, 0.95) 100%)',
      icon: <Waves className="w-5 h-5 text-cyan-400" />,
    },
    'aurora-resonance': {
      id: 'aurora-resonance',
      name: 'Aurora Resonance Chamber',
      subtitle: 'Harmonized Cardiopulmonary Alignment',
      description: 'Iridescent polar light curtains shimmering across space when heartbeats and respiration synchronize.',
      accent: '#a855f7',
      bgGrad: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.18) 0%, rgba(4, 7, 20, 0.95) 100%)',
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
    },
  };

  // State discovery evaluator based on natural biological fluctuations
  useEffect(() => {
    const pulse = telemetry.pulseBpm ?? 72;
    const breath = telemetry.breathingBrpm ?? 14;
    const coherence = telemetry.coherenceScore ?? 50;

    let targetBiome = 'celestial-grove';

    if (coherence >= 75) {
      targetBiome = 'aurora-resonance';
    } else if (breath <= 11) {
      targetBiome = 'deep-oceanic';
    } else if (pulse >= 88) {
      targetBiome = 'solar-nexus';
    } else {
      targetBiome = 'celestial-grove';
    }

    setActiveBiomeId(targetBiome);
    setDiscoveredBiomes((prev) => {
      const next = new Set(prev);
      next.add(targetBiome);
      return next;
    });
  }, [telemetry.pulseBpm, telemetry.breathingBrpm, telemetry.coherenceScore]);

  // Canvas visual rendering loop
  useEffect(() => {
    let animId: number;
    let startTime = Date.now();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isPaused) {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const elapsed = (Date.now() - startTime) / 1000;

        ctx.clearRect(0, 0, width, height);

        const currentBiome = biomes[activeBiomeId] || biomes['celestial-grove'];

        // 1. Render Biome Ethereal Background Vortex
        const radius = Math.min(width, height) * 0.45;
        const bgGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
        bgGrad.addColorStop(0, currentBiome.accent);
        bgGrad.addColorStop(1, 'rgba(4, 7, 20, 0)');
        ctx.fillStyle = bgGrad;
        ctx.globalAlpha = 0.22;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // 2. Render Biome Specific Generative Shapes
        if (activeBiomeId === 'aurora-resonance') {
          // Shimmering aurora waves
          ctx.save();
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, height * (0.3 + i * 0.1));
            for (let x = 0; x <= width; x += 30) {
              const y =
                height * (0.3 + i * 0.1) +
                Math.sin(x * 0.005 + elapsed * 1.5 + i) * 40 +
                Math.cos(x * 0.01 - elapsed) * 20;
              ctx.lineTo(x, y);
            }
            ctx.strokeStyle = i % 2 === 0 ? '#a855f7' : '#00f2fe';
            ctx.lineWidth = 14;
            ctx.globalAlpha = 0.25;
            ctx.shadowColor = currentBiome.accent;
            ctx.shadowBlur = 20;
            ctx.stroke();
          }
          ctx.restore();
        } else if (activeBiomeId === 'deep-oceanic') {
          // Drifting bioluminescent tidal rings
          ctx.save();
          for (let i = 0; i < 8; i++) {
            const ringR = ((elapsed * 25 + i * 45) % (width * 0.45)) + 20;
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = Math.max(0, 1 - ringR / (width * 0.45));
            ctx.beginPath();
            ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.restore();
        } else if (activeBiomeId === 'solar-nexus') {
          // Solar flares and energetic rays
          ctx.save();
          ctx.translate(cx, cy);
          for (let i = 0; i < 16; i++) {
            const angle = (i * Math.PI * 2) / 16 + elapsed * 0.2;
            const len = 90 + Math.sin(elapsed * 4 + i) * 45;
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.globalAlpha = 0.45;
            ctx.beginPath();
            ctx.moveTo(Math.cos(angle) * 40, Math.sin(angle) * 40);
            ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
            ctx.stroke();
          }
          ctx.restore();
        } else {
          // Celestial Grove: Sacred geometric concentric mandalas
          ctx.save();
          ctx.translate(cx, cy);
          for (let i = 0; i < 12; i++) {
            const angle = (i * Math.PI * 2) / 12 + elapsed * 0.08;
            const r = 85 + Math.sin(elapsed * 1.5 + i) * 20;
            ctx.fillStyle = '#10b981';
            ctx.globalAlpha = 0.35;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * r, Math.sin(angle) * r, 8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 3. Central Compass Core
        ctx.save();
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, currentBiome.accent);
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, activeBiomeId, biomes]);

  const current = biomes[activeBiomeId] || biomes['celestial-grove'];

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-midnight-950 p-6 select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-white/10">
            <Compass className="w-5 h-5 text-purple-400" />
            <span className="font-display font-bold text-sm text-white">Harmony Quest</span>
          </div>

          <div className="flex items-center gap-2 px-2 text-xs font-mono text-slate-300">
            <span>Discovered: <strong>{discoveredBiomes.size} of 4 Realms</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Journey' : 'Pause Journey'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Noncompetitive Philosophy & Safety"
          >
            <HelpCircle className="w-4 h-4 text-cosmic-cyan" />
          </button>
        </div>
      </div>

      {/* Main Interactive 2D Canvas */}
      <div className="flex-1 w-full relative my-2 rounded-3xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Active Realm Card */}
        <div className="absolute top-4 left-4 p-4 rounded-2xl bg-midnight-950/85 backdrop-blur-xl border border-white/10 shadow-2xl max-w-sm pointer-events-none space-y-1">
          <div className="flex items-center gap-2">
            {current.icon}
            <h4 className="font-display font-bold text-sm text-white">{current.name}</h4>
          </div>
          <p className="text-[11px] font-mono" style={{ color: current.accent }}>
            {current.subtitle}
          </p>
          <p className="text-xs text-slate-400 leading-relaxed pt-1">
            {current.description}
          </p>
        </div>
      </div>

      {/* Noncompetitive Philosophy Drawer */}
      {showExplanation && (
        <div className="absolute top-20 right-6 w-96 p-5 rounded-3xl bg-midnight-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3 z-30 text-xs animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-display font-bold text-white text-sm">Noncompetitive Biofeedback</span>
            <button onClick={() => setShowExplanation(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Exploration Over Scores:</strong> Harmony Quest deliberately rejects scores, leaderboards, and gamified targets. No physiological state is classified as &quot;good&quot;, &quot;bad&quot;, &quot;healthy&quot;, or &quot;unhealthy&quot;.
            </p>
            <p>
              <strong className="text-emerald-300">Safety First:</strong> We do not reward users for attempting extreme, hyperventilating, or unsafe breath-holding targets. The world simply mirrors your natural biological fluidity.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Biomes Discovery Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 z-10">
        <div className="flex items-center gap-2">
          {Object.values(biomes).map((b) => {
            const isUnlocked = discoveredBiomes.has(b.id);
            const isCurrent = activeBiomeId === b.id;
            return (
              <div
                key={b.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-white/30 bg-white/10 text-white font-bold'
                    : isUnlocked
                    ? 'border-white/10 bg-white/5 text-slate-300'
                    : 'border-white/5 bg-transparent text-slate-600 opacity-60'
                }`}
              >
                {b.icon}
                <span>{b.name}</span>
                {isUnlocked && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
              </div>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500">
          Noncompetitive Exploration • No physiological target scoring
        </div>
      </div>
    </div>
  );
};
