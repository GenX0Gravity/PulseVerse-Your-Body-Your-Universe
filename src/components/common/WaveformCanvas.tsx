import React, { useEffect, useRef } from 'react';

interface WaveformCanvasProps {
  data: number[];
  color?: 'cyan' | 'pink' | 'emerald' | 'violet';
  height?: number;
  showGrid?: boolean;
  label?: string;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  data,
  color = 'cyan',
  height = 80,
  showGrid = true,
  label,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colorPalettes = {
    cyan: { stroke: '#00f2fe', glow: 'rgba(0, 242, 254, 0.4)', fill: 'rgba(0, 242, 254, 0.08)' },
    pink: { stroke: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', fill: 'rgba(244, 63, 94, 0.08)' },
    emerald: { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', fill: 'rgba(16, 185, 129, 0.08)' },
    violet: { stroke: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', fill: 'rgba(168, 85, 247, 0.08)' },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const h = height;

    ctx.clearRect(0, 0, width, h);

    // Optional background oscilloscope grid
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Horizontal grid lines
      for (let y = 10; y < h; y += 16) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Vertical grid lines
      for (let x = 20; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
    }

    if (!data || data.length < 2) return;

    const palette = colorPalettes[color];
    const step = width / (data.length - 1);

    // Calculate min/max for normalization
    let min = -1.2;
    let max = 1.2;
    for (const v of data) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    const range = Math.max(0.1, max - min);

    // Draw path
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      // Normalize value to height with margin
      const normalized = (data[i] - min) / range;
      const y = h - (normalized * (h * 0.75) + h * 0.125);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // Glow effect
    ctx.shadowColor = palette.glow;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = palette.stroke;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw scanning tip dot at the latest point
    const lastX = (data.length - 1) * step;
    const lastNorm = (data[data.length - 1] - min) / range;
    const lastY = h - (lastNorm * (h * 0.75) + h * 0.125);

    ctx.fillStyle = palette.stroke;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Pulse halo on tip
    ctx.fillStyle = palette.glow;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 7, 0, Math.PI * 2);
    ctx.fill();
  }, [data, color, height, showGrid]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-midnight-950/60 border border-white/5 p-1">
      {label && (
        <div className="absolute top-2 left-3 text-[10px] uppercase font-mono tracking-widest text-slate-400 select-none pointer-events-none z-10">
          {label}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block"
      />
    </div>
  );
};
