import React, { useEffect, useRef, useState } from 'react';
import { Camera, Shield, Square, FlipHorizontal, Maximize2, Minimize2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  const { stream, isRunning, isInitializing, validation } = useSmartSpectra();
  const { mode, stopSession } = useAppStore();
  const [isMirrored, setIsMirrored] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Video playback notice:', err);
      });
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullScreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullScreen = async () => {
    if (window.pulseVerse?.toggleFullScreen) {
      const full = await window.pulseVerse.toggleFullScreen();
      setIsFullScreen(full);
    } else {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen().catch(() => {});
        setIsFullScreen(true);
      } else {
        await document.exitFullscreen().catch(() => {});
        setIsFullScreen(false);
      }
    }
  };

  return (
    <div
      onDoubleClick={handleToggleFullScreen}
      className={`relative overflow-hidden rounded-2xl bg-midnight-950 border border-white/10 ${className}`}
    >
      {/* Live Video Element */}
      {stream && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-all duration-300 ${
            isMirrored ? 'scale-x-[-1]' : 'scale-x-100'
          }`}
        />
      )}

      {/* Floating Action Buttons when streaming */}
      {stream && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
          {/* Flip / Mirror Button */}
          <button
            onClick={() => setIsMirrored((prev) => !prev)}
            className="p-2 rounded-xl bg-midnight-950/80 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            title={isMirrored ? 'Disable Mirroring' : 'Enable Mirroring'}
            aria-label="Toggle camera mirroring"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullScreen}
            className="p-2 rounded-xl bg-midnight-950/80 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 shadow-lg backdrop-blur-md transition-all"
            title={isFullScreen ? 'Exit Full Screen' : 'Enter Full Screen (F11)'}
            aria-label="Toggle full screen"
          >
            {isFullScreen ? (
              <Minimize2 className="w-3.5 h-3.5 text-cosmic-cyan" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Stop Camera Button */}
          <button
            onClick={stopSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/85 hover:bg-rose-500 text-white font-mono text-xs font-semibold shadow-lg backdrop-blur-md transition-all focus-visible:ring-2 focus-visible:ring-rose-400"
            title="Immediately close camera device and stop sensing"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Stop Camera</span>
          </button>
        </div>
      )}

      {/* Hardware Active Status Pill */}
      {stream && (
        <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold z-20 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>CAMERA STREAMING</span>
          {validation.isMeasurementReady ? (
            <span className="flex items-center gap-1 text-emerald-400 border-l border-white/10 pl-2">
              <CheckCircle2 className="w-3 h-3" />
              <span>OPTICAL LOCK</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-300 border-l border-white/10 pl-2">
              <AlertCircle className="w-3 h-3" />
              <span>{validation.hint}</span>
            </span>
          )}
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
