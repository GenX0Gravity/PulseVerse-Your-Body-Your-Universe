import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Download,
  Check,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { useVitalsStore } from '../../../store/useVitalsStore';
import { Button } from '../../common/Button';

interface StarNode {
  x: number;
  y: number;
  baseRadius: number;
  vx: number;
  vy: number;
  brightness: number;
  connections: number[];
}

export type ConstellationTheme = 'supernova-cyan' | 'amethyst-nebula' | 'solar-gold';

export const PulseConstellation: React.FC = () => {
  const { telemetry } = useVitalsStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState<ConstellationTheme>('supernova-cyan');
  const [snapshotTaken, setSnapshotTaken] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Generate unique constellation seed name per session
  const constellationName = useMemo(() => {
    const prefixes = ['Astra', 'Cygnus', 'Vespera', 'Orion', 'Lyra', 'Solaria', 'Zenith'];
    const suffixes = ['Nebula', 'Pulse', 'Major', 'Core', 'Vortex', 'Prime', 'Nova'];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    const id = Math.floor(Math.random() * 899 + 100);
    return `${p}-${s} #${id}`;
  }, []);

  // Theme palettes
  const palette = {
    'supernova-cyan': {
      star: '#00f2fe',
      line: 'rgba(0, 242, 254, 0.35)',
      burst: '#ec4899',
      bgGlow: 'rgba(0, 242, 254, 0.1)',
    },
    'amethyst-nebula': {
      star: '#c084fc',
      line: 'rgba(192, 132, 252, 0.35)',
      burst: '#f43f5e',
      bgGlow: 'rgba(168, 85, 247, 0.1)',
    },
    'solar-gold': {
      star: '#fbbf24',
      line: 'rgba(251, 191, 36, 0.35)',
      burst: '#ef4444',
      bgGlow: 'rgba(245, 158, 11, 0.1)',
    },
  }[theme];

  // Initialize star nodes
  const starsRef = useRef<StarNode[]>([]);
  const burstsRef = useRef<{ x: number; y: number; radius: number; alpha: number; color: string }[]>([]);
  const prevWaveformRef = useRef<number>(0);
  const prevSlopeRef = useRef<number>(0);

  useEffect(() => {
    // Generate 32 unique star nodes in an astrological layout
    const nodeCount = 32;
    const nodes: StarNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random(),
        y: Math.random(),
        baseRadius: 1.8 + Math.random() * 2.8,
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        brightness: 0.5 + Math.random() * 0.5,
        connections: [],
      });
    }

    // Connect nearest nodes
    for (let i = 0; i < nodeCount; i++) {
      const distances = nodes
        .map((n, idx) => ({
          idx,
          dist: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y),
        }))
        .filter((d) => d.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);

      nodes[i].connections = distances.map((d) => d.idx);
    }

    starsRef.current = nodes;
  }, []);

  // Canvas Render Loop
  useEffect(() => {
    let animId: number;
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

        ctx.clearRect(0, 0, width, height);

        // 1. Evaluate Pulse Deflection & Peak Detection for Starburst
        const hasPulse = Boolean(telemetry.pulseBpm && telemetry.pulseBpm > 0 && telemetry.signalQuality >= 25);
        const waveSample = telemetry.pulseWaveform[telemetry.pulseWaveform.length - 1] ?? 0;
        const slope = waveSample - prevWaveformRef.current;

        // Peak trigger: slope reversal from positive to negative on high systolic amplitude
        if (prevSlopeRef.current > 0 && slope <= 0 && waveSample > 0.4) {
          // Trigger a dramatic starburst on a random prominent star
          const stars = starsRef.current;
          if (stars.length > 0) {
            const randomStar = stars[Math.floor(Math.random() * stars.length)];
            burstsRef.current.push({
              x: randomStar.x * width,
              y: randomStar.y * height,
              radius: 4,
              alpha: 0.9,
              color: palette.burst,
            });
          }
        }

        prevWaveformRef.current = waveSample;
        prevSlopeRef.current = slope;

        // Speed multiplier derived from pulse rate
        const pulseTempo = hasPulse ? telemetry.pulseBpm! / 72 : 1.0;
        const pulseIntensity = Math.max(0.1, waveSample);

        // 2. Animate Starbursts
        for (let b = burstsRef.current.length - 1; b >= 0; b--) {
          const burst = burstsRef.current[b];
          burst.radius += 4.5;
          burst.alpha -= 0.025;

          if (burst.alpha <= 0) {
            burstsRef.current.splice(b, 1);
            continue;
          }

          ctx.save();
          ctx.strokeStyle = burst.color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = burst.alpha;
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
          ctx.stroke();

          // Starflare cross spikes
          const spikeLen = burst.radius * 1.5;
          ctx.beginPath();
          ctx.moveTo(burst.x - spikeLen, burst.y);
          ctx.lineTo(burst.x + spikeLen, burst.y);
          ctx.moveTo(burst.x, burst.y - spikeLen);
          ctx.lineTo(burst.x, burst.y + spikeLen);
          ctx.stroke();
          ctx.restore();
        }

        // 3. Draw Constellation Connection Lines
        const stars = starsRef.current;
        ctx.save();
        ctx.strokeStyle = palette.line;
        ctx.lineWidth = 1.2;

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const sx = star.x * width;
          const sy = star.y * height;

          for (const targetIdx of star.connections) {
            const target = stars[targetIdx];
            const tx = target.x * width;
            const ty = target.y * height;

            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
        }
        ctx.restore();

        // 4. Render Stars with Pulse Glow
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];

          // Gentle orbital drift
          star.x += star.vx * pulseTempo;
          star.y += star.vy * pulseTempo;
          if (star.x < 0.05 || star.x > 0.95) star.vx *= -1;
          if (star.y < 0.05 || star.y > 0.95) star.vy *= -1;

          const sx = star.x * width;
          const sy = star.y * height;
          const radius = star.baseRadius * (1.0 + pulseIntensity * 0.65);

          // Star Glow
          ctx.save();
          const starGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius * 3.5);
          starGrad.addColorStop(0, '#ffffff');
          starGrad.addColorStop(0.3, palette.star);
          starGrad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = starGrad;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Central core
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 0.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // 5. Constellation Celestial Seal Header (Artistic only, no private biometric values)
        ctx.save();
        ctx.font = 'bold 16px "Space Grotesk", sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillText(constellationName, 32, 42);

        ctx.font = '11px monospace';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.7)';
        ctx.fillText('Celestial Session Archetype • Pulse-Driven Star Geometry', 32, 60);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, palette, constellationName, telemetry]);

  // Export clean visual snapshot (EXCLUDING camera frames, personal info, and raw medical data)
  const handleExportSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary high-res export canvas with clean artwork only
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1920;
    exportCanvas.height = 1080;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    // Deep cosmic space background
    ctx.fillStyle = '#03050c';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw existing artwork scaled up
    ctx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);

    // Add elegant artistic signature without any private data
    ctx.save();
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`PULSEVERSE • ${constellationName.toUpperCase()}`, 64, exportCanvas.height - 80);

    ctx.font = '14px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('Generative Cosmic Biofeedback Artwork • Presage SmartSpectra SDK', 64, exportCanvas.height - 52);
    ctx.restore();

    // Trigger download
    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `PulseVerse_${constellationName.replace(/\s+/g, '_')}_Artwork.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setSnapshotTaken(true);
    setTimeout(() => setSnapshotTaken(false), 2500);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-midnight-950 p-6 select-none overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-auto">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-white/10">
            <Sparkles className="w-5 h-5 text-cosmic-cyan" />
            <span className="font-display font-bold text-sm text-white">Pulse Constellation</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['supernova-cyan', 'amethyst-nebula', 'solar-gold'] as ConstellationTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl capitalize transition-all ${
                  theme === t
                    ? 'bg-cosmic-cyan text-midnight-950 font-bold shadow-glow-cyan'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Snapshot & Playback Actions */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
          <Button
            size="sm"
            variant="primary"
            onClick={handleExportSnapshot}
            icon={snapshotTaken ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
          >
            {snapshotTaken ? 'Saved Visual Artwork!' : 'Export Artwork Snapshot'}
          </Button>

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Orbit' : 'Pause Orbit'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Snapshot Privacy Architecture"
          >
            <HelpCircle className="w-4 h-4 text-cosmic-cyan" />
          </button>
        </div>
      </div>

      {/* Main Interactive 2D Canvas */}
      <div className="flex-1 w-full relative my-2 rounded-3xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Snapshot Privacy Explanatory Modal */}
      {showExplanation && (
        <div className="absolute top-20 right-6 w-96 p-5 rounded-3xl bg-midnight-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3 z-30 text-xs animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-display font-bold text-white text-sm">Visual Artwork Privacy Guarantee</span>
            <button onClick={() => setShowExplanation(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2 text-slate-300 leading-relaxed">
            <p>
              When you export an artwork snapshot, PulseVerse automatically:
            </p>
            <ul className="space-y-1 list-disc list-inside text-emerald-300 font-semibold">
              <li>Excludes webcam camera feeds and face landmarks</li>
              <li>Excludes your real-time heart rate and medical values</li>
              <li>Excludes any user identifiers or machine metadata</li>
            </ul>
            <p className="text-slate-400">
              Only the artistic astronomical geometry, constellation stars, and cosmic color grading are preserved.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-cosmic-pink" />
          <span>Star Kinetic Tempo: <strong className="text-white">{telemetry.pulseBpm ? `${telemetry.pulseBpm} BPM` : '72 BPM'}</strong></span>
          <span>•</span>
          <span>Starbursts: <strong className="text-cosmic-cyan">Systolic Waveform Triggered</strong></span>
        </div>

        <div className="text-[11px] text-slate-500">
          Privacy-Safe Celestial Export • Zero Personal Biometrics in Image
        </div>
      </div>
    </div>
  );
};
