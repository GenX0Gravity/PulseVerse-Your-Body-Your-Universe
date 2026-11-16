import React, { useEffect, useRef } from 'react';
import { useVitalsStore } from '../../../store/useVitalsStore';

export const BioResonanceMandala: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { telemetry } = useVitalsStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let rotation = 0;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Coherence drives harmonic rings (0 to 100)
      const coherence = telemetry.coherenceScore || 70;
      const pulseVal =
        telemetry.pulseWaveform[telemetry.pulseWaveform.length - 1] || 0;
      const breathVal =
        telemetry.breathingWaveform[telemetry.breathingWaveform.length - 1] || 0;

      rotation += 0.008 + (coherence / 100) * 0.01;

      const baseRadius = Math.min(w, h) * 0.22 * (1 + pulseVal * 0.08);
      const rings = 5;
      const petals = 8 + Math.floor(coherence / 20);

      ctx.save();
      ctx.translate(cx, cy);

      for (let r = 1; r <= rings; r++) {
        ctx.save();
        ctx.rotate(rotation * (r % 2 === 0 ? 1 : -1));

        const radius = (baseRadius / rings) * r * (1 + breathVal * 0.1);
        ctx.beginPath();
        for (let i = 0; i < petals; i++) {
          const theta = (i * Math.PI * 2) / petals;
          const petalRadius = radius * (1 + 0.3 * Math.sin(theta * 3 + rotation));
          const x = Math.cos(theta) * petalRadius;
          const y = Math.sin(theta) * petalRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        // Color based on resonance
        const hue = 180 + (coherence / 100) * 100; // Cyan to violet
        ctx.strokeStyle = `hsla(${hue}, 85%, 65%, ${0.3 + (r / rings) * 0.5})`;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = `hsla(${hue}, 90%, 55%, 0.5)`;
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.restore();
      }

      // Center glowing coherence core
      ctx.beginPath();
      ctx.arc(0, 0, 8 + (coherence / 100) * 8, 0, Math.PI * 2);
      ctx.fillStyle = '#00f2fe';
      ctx.shadowColor = '#00f2fe';
      ctx.shadowBlur = 15;
      ctx.fill();

      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [telemetry]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-midnight-950 p-6">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-display font-bold text-white tracking-wide">
          Bio-Resonance Mandala
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          A sacred geometry visualizer whose petals synchronize with respiratory-cardiac coupling and coherence.
        </p>
      </div>

      <canvas ref={canvasRef} className="w-full h-full max-w-2xl max-h-[500px]" />

      <div className="absolute bottom-6 flex items-center gap-6 px-6 py-3 rounded-2xl bg-midnight-900/80 backdrop-blur-xl border border-white/10 font-mono text-xs">
        <div>
          <span className="text-slate-400">Harmony Index:</span>{' '}
          <span className="font-bold text-cosmic-cyan">{telemetry.coherenceScore}%</span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <div>
          <span className="text-slate-400">Pulse Coupling:</span>{' '}
          <span className="font-bold text-purple-300">Synchronized</span>
        </div>
      </div>
    </div>
  );
};
