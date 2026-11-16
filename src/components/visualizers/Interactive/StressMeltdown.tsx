import React, { useEffect, useRef } from 'react';
import { useVitalsStore } from '../../../store/useVitalsStore';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  originalX: number;
  originalY: number;
}

export const StressMeltdown: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { telemetry } = useVitalsStore();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    // Create 400 lattice particles that melt with stress / calm down with breath
    const particles: Particle[] = [];
    const cols = 20;
    const rows = 20;
    const stepX = (w * 0.5) / cols;
    const stepY = (h * 0.5) / rows;
    const startX = w * 0.25;
    const startY = h * 0.25;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const ox = startX + i * stepX;
        const oy = startY + j * stepY;
        particles.push({
          x: ox,
          y: oy,
          originalX: ox,
          originalY: oy,
          vx: 0,
          vy: 0,
          size: 2.5 + Math.random() * 2,
          color: (i + j) % 2 === 0 ? '#00f2fe' : '#a855f7',
        });
      }
    }
    particlesRef.current = particles;

    let animId: number;

    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // Coherence / calmness (0 to 100)
      const coherence = telemetry.coherenceScore || 70;
      const meltFactor = (100 - coherence) / 100; // High stress = chaotic melt, High coherence = structured crystal
      const breathVal =
        telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] || 0;

      particlesRef.current.forEach((p, idx) => {
        // Random fluid drift amplified by tension
        const noiseX = Math.sin(Date.now() * 0.002 + idx) * meltFactor * 6;
        const noiseY = Math.cos(Date.now() * 0.002 + idx) * meltFactor * 6;

        // Tendency to return home when calm
        const spring = 0.04 * (coherence / 100);
        p.vx += (p.originalX + noiseX - p.x) * spring;
        p.vy += (p.originalY + noiseY - p.y) * spring;

        // Friction
        p.vx *= 0.88;
        p.vy *= 0.88;

        p.x += p.vx;
        p.y += p.vy;

        // Render particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + breathVal * 0.15), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [telemetry]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-midnight-950 p-6">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-display font-bold text-white tracking-wide">
          Stress Meltdown & Coherence Lattice
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          Witness physiological tension dissolve into fluid particles. Deeper breaths restore crystallographic alignment.
        </p>
      </div>

      <canvas ref={canvasRef} className="w-full h-full max-w-2xl max-h-[500px]" />

      <div className="absolute bottom-6 flex items-center gap-6 px-6 py-3 rounded-2xl bg-midnight-900/80 backdrop-blur-xl border border-white/10 font-mono text-xs">
        <div>
          <span className="text-slate-400">Coherence Stability:</span>{' '}
          <span className="font-bold text-cosmic-emerald">
            {telemetry.coherenceScore}% Resonant
          </span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <div>
          <span className="text-slate-400">HRV (RMSSD):</span>{' '}
          <span className="font-bold text-purple-300">
            {telemetry.hrvRmssd ? `${telemetry.hrvRmssd} ms` : '58 ms'}
          </span>
        </div>
      </div>
    </div>
  );
};
