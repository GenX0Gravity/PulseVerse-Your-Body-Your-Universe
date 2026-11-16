import React, { useEffect, useRef } from 'react';
import { useVitalsStore } from '../../../store/useVitalsStore';

export const ChronoPulseClock: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { telemetry } = useVitalsStore();
  const tickAngleRef = useRef(0);
  const lastBeatRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

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

      // On new heartbeat: step angle forward by 6 degrees (1 second tick)
      if (telemetry.lastHeartbeatTime && telemetry.lastHeartbeatTime !== lastBeatRef.current) {
        lastBeatRef.current = telemetry.lastHeartbeatTime;
        tickAngleRef.current += (Math.PI * 2) / 60;
      }

      const radius = Math.min(w, h) * 0.35;

      ctx.save();
      ctx.translate(cx, cy);

      // Outer Dial
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tick marks (60 seconds)
      for (let i = 0; i < 60; i++) {
        const theta = (i * Math.PI * 2) / 60;
        const isMajor = i % 5 === 0;
        const tickLength = isMajor ? 12 : 5;

        const x1 = Math.cos(theta) * (radius - tickLength);
        const y1 = Math.sin(theta) * (radius - tickLength);
        const x2 = Math.cos(theta) * radius;
        const y2 = Math.sin(theta) * radius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = isMajor ? '#00f2fe' : 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = isMajor ? 2 : 1;
        ctx.stroke();
      }

      // Escapement Gear wheel (rotates in tempo)
      ctx.save();
      ctx.rotate(tickAngleRef.current);

      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Gear teeth
      const teeth = 12;
      for (let i = 0; i < teeth; i++) {
        const th = (i * Math.PI * 2) / teeth;
        const gx = Math.cos(th) * (radius * 0.5);
        const gy = Math.sin(th) * (radius * 0.5);
        ctx.beginPath();
        ctx.arc(gx, gy, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
      }

      // Main Hand pointing to tick angle
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radius * 0.85);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.restore();

      // Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [telemetry]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden bg-midnight-950 p-6">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xl font-display font-bold text-white tracking-wide">
          Chrono-Pulse Clockwork
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm">
          A kinetic celestial timepiece whose escapement ticks directly in tempo with each biological heartbeat.
        </p>
      </div>

      <canvas ref={canvasRef} className="w-full h-full max-w-xl max-h-[480px]" />

      <div className="absolute bottom-6 flex items-center gap-6 px-6 py-3 rounded-2xl bg-midnight-900/80 backdrop-blur-xl border border-white/10 font-mono text-xs">
        <div>
          <span className="text-slate-400">Current Tempo:</span>{' '}
          <span className="font-bold text-cosmic-pink">
            {telemetry.pulseBpm ? `${telemetry.pulseBpm} BPM` : '--'}
          </span>
        </div>
        <div className="h-3 w-[1px] bg-white/10" />
        <div>
          <span className="text-slate-400">Precision:</span>{' '}
          <span className="font-bold text-cosmic-cyan">Sub-millisecond rPPG</span>
        </div>
      </div>
    </div>
  );
};
