import React, { useEffect, useRef } from 'react';
import { Camera, Shield, Square } from 'lucide-react';
import { AlignmentReticle } from './AlignmentReticle';
import { useSmartSpectra } from '../../hooks/useSmartSpectra';
import { useAppStore } from '../../store/useAppStore';

interface CameraPreviewProps {
  className?: string;
  showReticle?: boolean;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  className = '',
  showReticle = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { stream, isRunning, isInitializing } = useSmartSpectra();
  const { mode, stopSession } = useAppStore();

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => {
        console.warn('Video playback notice:', err);
      });
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-midnight-950 border border-white/10 ${className}`}>
      {/* Live Video Element */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1] transition-opacity duration-500"
        />
      )}

      {/* Floating Quick Stop Button when streaming */}
      {stream && (
        <button
          onClick={stopSession}
          className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-500/85 hover:bg-rose-500 text-white font-mono text-xs font-semibold shadow-lg backdrop-blur-md transition-all focus-visible:ring-2 focus-visible:ring-rose-400 z-20"
          title="Immediately close camera device and stop sensing"
        >
          <Square className="w-3.5 h-3.5 fill-current" />
          <span>Stop Camera</span>
        </button>
      )}

      {/* Hardware Active Status Pill */}
      {stream && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold z-20">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>CAMERA STREAMING</span>
        </div>
      )}

      {/* Simulated camera feed visualizer in Demo Mode */}
      {mode === 'demo' && !stream && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-850 p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 mb-3 animate-pulse-cardiac">
            <Shield className="w-8 h-8" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-500/50 text-xs font-mono font-bold tracking-wider mb-2">
            SIMULATED DATA
          </span>
          <h4 className="text-sm font-semibold text-white tracking-wide">Synthetic Physiological Model</h4>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            Simulated optical physiological telemetry is running. Switch to Live Camera mode anytime for real sensing.
          </p>
        </div>
      )}

      {/* Camera Inactive placeholder */}
      {mode === 'live' && !stream && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-midnight-950 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 mb-3">
            <Camera className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-medium text-slate-300">
            {isInitializing ? 'Connecting to Camera...' : 'Camera Standby'}
          </h4>
          <p className="text-xs text-slate-500 max-w-xs mt-1">
            Click &quot;Start Sensing&quot; to begin contactless vitals detection.
          </p>
        </div>
      )}

      {/* Alignment reticle overlay */}
      {showReticle && <AlignmentReticle active={isRunning || mode === 'demo'} />}

      {/* Privacy guarantee badge overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-midnight-950/80 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono z-10">
        <Shield className="w-3 h-3 text-emerald-400" />
        <span>100% On-Device • Zero Cloud Transmission</span>
      </div>
    </div>
  );
};
