import React, { useState, useEffect, useRef } from 'react';
import {
  Flower2,
  Wind,
  Play,
  Pause,
  HelpCircle,
} from 'lucide-react';
import { useVitalsStore } from '../../../store/useVitalsStore';
import { useAppStore } from '../../../store/useAppStore';

export type FlowerTheme = 'moon-lotus' | 'solar-orchid' | 'ethereal-peony';
export type GuidedPacerMode = 'none' | 'coherence' | '4-7-8' | 'box';

export const BreathingBloom: React.FC = () => {
  const { telemetry } = useVitalsStore();
  const { mode } = useAppStore();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState<FlowerTheme>('moon-lotus');
  const [pacerMode, setPacerMode] = useState<GuidedPacerMode>('coherence');
  const [showExplanation, setShowExplanation] = useState(false);

  // Palettes
  const themeColors = {
    'moon-lotus': {
      petals: '#10b981',
      emissive: '#00f2fe',
      core: '#38bdf8',
      bgGlow: 'rgba(0, 242, 254, 0.12)',
    },
    'solar-orchid': {
      petals: '#f59e0b',
      emissive: '#ef4444',
      core: '#f97316',
      bgGlow: 'rgba(245, 158, 11, 0.12)',
    },
    'ethereal-peony': {
      petals: '#c084fc',
      emissive: '#f43f5e',
      core: '#e879f9',
      bgGlow: 'rgba(217, 70, 239, 0.12)',
    },
  }[theme];

  // Canvas 2D / 60 FPS Render Loop
  useEffect(() => {
    let animId: number;
    let startTime = Date.now();
    let smoothedBreath = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!isPaused) {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;

        // Resize if needed
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;

        ctx.clearRect(0, 0, width, height);

        // 1. Determine Measured User Breath Expansion
        const hasSignal = Boolean(telemetry.breathingBrpm && telemetry.breathingBrpm > 0 && telemetry.signalQuality >= 25);
        const rawWave = telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] ?? 0;

        let targetBreath = 0;
        if (hasSignal || mode === 'demo') {
          targetBreath = Math.max(-1.0, Math.min(1.0, rawWave));
        } else {
          // Resting gentle wave when calibrating or inactive
          targetBreath = Math.sin(elapsed * 1.2) * 0.25;
        }

        smoothedBreath += (targetBreath - smoothedBreath) * 0.1;
        const normalizedMeasured = (smoothedBreath + 1.0) / 2.0; // 0.0 to 1.0

        // 2. Compute Guided Pacer Expansion (if enabled)
        let pacerExpansion = 0; // -1 to 1
        let pacerPhaseText = '';

        if (pacerMode === 'coherence') {
          // 5.5 breaths per minute (cycle = 10.9s: 5.5s inhale, 5.5s exhale)
          const cycleDuration = 10.9;
          const cyclePos = (elapsed % cycleDuration) / cycleDuration;
          pacerExpansion = -Math.cos(cyclePos * Math.PI * 2);
          pacerPhaseText = pacerExpansion > 0 ? 'Pacer: Inhale Gently' : 'Pacer: Exhale Slowly';
        } else if (pacerMode === '4-7-8') {
          // 4s inhale, 7s hold, 8s exhale = 19s total
          const cycleDuration = 19.0;
          const phase = elapsed % cycleDuration;
          if (phase < 4.0) {
            pacerExpansion = -1.0 + (phase / 4.0) * 2.0;
            pacerPhaseText = 'Pacer: Inhale (4s)';
          } else if (phase < 11.0) {
            pacerExpansion = 1.0;
            pacerPhaseText = 'Pacer: Soft Hold (7s)';
          } else {
            pacerExpansion = 1.0 - ((phase - 11.0) / 8.0) * 2.0;
            pacerPhaseText = 'Pacer: Exhale (8s)';
          }
        } else if (pacerMode === 'box') {
          // 4s in, 4s hold, 4s out, 4s hold = 16s total
          const cycleDuration = 16.0;
          const phase = elapsed % cycleDuration;
          if (phase < 4.0) {
            pacerExpansion = -1.0 + (phase / 4.0) * 2.0;
            pacerPhaseText = 'Pacer: Inhale (4s)';
          } else if (phase < 8.0) {
            pacerExpansion = 1.0;
            pacerPhaseText = 'Pacer: Hold In (4s)';
          } else if (phase < 12.0) {
            pacerExpansion = 1.0 - ((phase - 8.0) / 4.0) * 2.0;
            pacerPhaseText = 'Pacer: Exhale (4s)';
          } else {
            pacerExpansion = -1.0;
            pacerPhaseText = 'Pacer: Hold Out (4s)';
          }
        }

        const normalizedPacer = (pacerExpansion + 1.0) / 2.0;

        // 3. Render Background Ambient Glow (Paced by Breathing Rate)
        const tempo = telemetry.breathingBrpm ? telemetry.breathingBrpm / 14 : 1.0;
        const bgRadius = Math.min(width, height) * 0.42 * (1.0 + normalizedMeasured * 0.25);
        const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, bgRadius);
        grad.addColorStop(0, themeColors.bgGlow);
        grad.addColorStop(1, 'rgba(3, 5, 12, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, bgRadius, 0, Math.PI * 2);
        ctx.fill();

        // 4. Render Guided Pacer Ring (Explicitly Distinct from Measured Flower)
        if (pacerMode !== 'none') {
          const guideRadius = Math.min(width, height) * (0.28 + normalizedPacer * 0.12);
          ctx.save();
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 8]);
          ctx.lineDashOffset = -elapsed * 12;
          ctx.beginPath();
          ctx.arc(cx, cy, guideRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Pacer guidance label tag
          ctx.fillStyle = '#c084fc';
          ctx.font = '11px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`[PACER GUIDANCE: ${pacerPhaseText}]`, cx, cy - guideRadius - 10);
          ctx.restore();
        }

        // 5. Render User's Measured Luminous Flower Petals
        const petalLayers = 3;
        const petalsPerLayer = 8;
        const maxPetalRadius = Math.min(width, height) * 0.22 * (0.7 + normalizedMeasured * 0.55);

        for (let l = 0; l < petalLayers; l++) {
          const layerScale = 1.0 - l * 0.24;
          const layerRotation = elapsed * 0.05 * tempo * (l % 2 === 0 ? 1 : -1) + (l * Math.PI) / 8;

          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(layerRotation);

          for (let p = 0; p < petalsPerLayer; p++) {
            const angle = (p * Math.PI * 2) / petalsPerLayer;
            ctx.save();
            ctx.rotate(angle);

            const pRadius = maxPetalRadius * layerScale;
            const pWidth = pRadius * 0.52;

            // Draw organic petal bezier spline
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(pWidth, pRadius * 0.4, pWidth * 0.8, pRadius * 0.9, 0, pRadius);
            ctx.bezierCurveTo(-pWidth * 0.8, pRadius * 0.9, -pWidth, pRadius * 0.4, 0, 0);

            // Shading & opacity based on measured breath expansion
            ctx.fillStyle = l === 0 ? themeColors.petals : themeColors.emissive;
            ctx.globalAlpha = 0.35 + normalizedMeasured * 0.45 - l * 0.1;
            ctx.shadowColor = themeColors.emissive;
            ctx.shadowBlur = 15 * normalizedMeasured;
            ctx.fill();

            ctx.strokeStyle = themeColors.emissive;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.7;
            ctx.stroke();

            ctx.restore();
          }
          ctx.restore();
        }

        // 6. Central Glowing Pistil / Nucleus
        ctx.save();
        const pistilRadius = 18 + normalizedMeasured * 14;
        const pistilGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, pistilRadius);
        pistilGrad.addColorStop(0, '#ffffff');
        pistilGrad.addColorStop(0.5, themeColors.core);
        pistilGrad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = pistilGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, pistilRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 7. Measurement Source Badge Tag
        ctx.save();
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = hasSignal ? '#10b981' : mode === 'demo' ? '#f59e0b' : '#38bdf8';
        const labelText = mode === 'demo'
          ? '● [USER MEASURED: SYNTHETIC SIMULATION MODEL]'
          : hasSignal
          ? `● [USER MEASURED: REAL THORACIC MOVEMENT • ${telemetry.breathingBrpm} BrPM]`
          : '○ [CALIBRATING / SENSOR STANDBY]';
        ctx.fillText(labelText, cx, cy + Math.min(width, height) * 0.36);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, theme, pacerMode, telemetry, mode]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-midnight-950 p-6 select-none overflow-hidden">
      {/* Top Floating Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 z-10 pointer-events-auto">
        {/* Title & Theme Selector */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 pl-2 pr-3 border-r border-white/10">
            <Flower2 className="w-5 h-5 text-emerald-400" />
            <span className="font-display font-bold text-sm text-white">Breathing Bloom</span>
          </div>

          <div className="flex items-center gap-1.5">
            {(['moon-lotus', 'solar-orchid', 'ethereal-peony'] as FlowerTheme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl capitalize transition-all ${
                  theme === t
                    ? 'bg-emerald-400 text-midnight-950 font-bold shadow-glow-emerald'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Guided Pacer Options */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-midnight-900/85 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
          <span className="text-slate-400 pl-2">Guided Pacer:</span>
          {(['none', 'coherence', '4-7-8', 'box'] as GuidedPacerMode[]).map((pm) => (
            <button
              key={pm}
              onClick={() => setPacerMode(pm)}
              className={`px-2.5 py-1 rounded-xl uppercase transition-all ${
                pacerMode === pm
                  ? 'bg-purple-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {pm}
            </button>
          ))}

          {/* Pause / Resume Button */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 ml-1 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Animation' : 'Pause Animation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Info toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Explanation of Measured Signals"
          >
            <HelpCircle className="w-4 h-4 text-cosmic-cyan" />
          </button>
        </div>
      </div>

      {/* Main Interactive 2D Canvas */}
      <div className="flex-1 w-full relative my-2 rounded-3xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Accessible Explanation Modal / Bottom Drawer */}
      {showExplanation && (
        <div className="absolute top-20 right-6 w-96 p-5 rounded-3xl bg-midnight-950/95 backdrop-blur-2xl border border-white/15 shadow-2xl space-y-3 z-30 text-xs animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-display font-bold text-white text-sm">How Breathing Bloom Works</span>
            <button onClick={() => setShowExplanation(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="space-y-2 text-slate-300 leading-relaxed">
            <p>
              <strong className="text-white">Measured Thoracic Expansion:</strong> The inner blooming petals expand and contract with actual chest kinematics captured by your camera.
            </p>
            <p>
              <strong className="text-purple-300">Guided Pacer Halo:</strong> The optional dashed outer ring provides a visual pacing cue (e.g. 5.5 BrPM Coherence or 4-7-8). It is intentionally distinct from your measured body motion.
            </p>
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-[11px]">
              <strong>Non-Therapeutic Disclaimer:</strong> This experience provides artistic biofeedback. It is not intended to treat, cure, or diagnose respiratory or anxiety disorders.
            </div>
          </div>
        </div>
      )}

      {/* Bottom Status & Diagnostics */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 z-10">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-emerald-400" />
          <span>Cadence: <strong className="text-white">{telemetry.breathingBrpm ? `${telemetry.breathingBrpm} BrPM` : '14 BrPM'}</strong></span>
          <span>•</span>
          <span>Phase: <strong className="text-emerald-300">{telemetry.isBreathingIn ? 'Inhalation' : 'Exhalation'}</strong></span>
        </div>

        <div className="text-[11px] text-slate-500">
          Artistic Respiratory Biofeedback • No medical claims
        </div>
      </div>
    </div>
  );
};
