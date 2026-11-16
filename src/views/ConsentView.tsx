import React, { useState } from 'react';
import {
  ShieldCheck,
  Video,
  Lock,
  ArrowRight,
  EyeOff,
  AlertOctagon,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useCamera } from '../hooks/useCamera';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { CameraPreview } from '../components/camera/CameraPreview';

export const ConsentView: React.FC = () => {
  const { setActiveView, setCameraConsented, setOnboardingCompleted, setMode } = useAppStore();
  const { devices, selectedDeviceId, setSelectedDeviceId, requestPermission } = useCamera();
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasGranted, setHasGranted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleGrantConsent = async () => {
    setIsRequesting(true);
    setPermissionDenied(false);
    const granted = await requestPermission();
    setIsRequesting(false);

    if (granted) {
      setHasGranted(true);
      setCameraConsented(true);
      setOnboardingCompleted(true);
      setMode('live');
      setTimeout(() => {
        setActiveView('dashboard');
      }, 700);
    } else {
      setPermissionDenied(true);
    }
  };

  const handleSkipToDemo = () => {
    setCameraConsented(false);
    setOnboardingCompleted(true);
    setMode('demo');
    setActiveView('dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4" />
          Privacy First Protocol
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white">
          Camera Consent & Privacy Onboarding
        </h2>
        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          PulseVerse uses camera-based remote photoplethysmography (rPPG) to measure subtle optical blood volume pulse changes and chest micro-movements.
        </p>
      </div>

      {/* Permission Denied Recovery Banner */}
      {permissionDenied && (
        <div className="p-6 rounded-3xl bg-rose-500/15 border border-rose-500/30 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-white">
                Camera Access Was Blocked or Unavailable
              </h3>
              <p className="text-xs text-rose-200 leading-relaxed">
                PulseVerse could not access your webcam. The request may have been denied or another application may currently hold exclusive hardware access.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-midnight-950/70 border border-white/5 space-y-2 text-xs text-slate-300">
            <span className="font-semibold text-white block">How to Restore Camera Access:</span>
            <ul className="space-y-1.5 list-disc list-inside text-slate-400">
              <li>
                <strong className="text-slate-200">Windows 10/11:</strong> Open <em>Settings &rarr; Privacy & Security &rarr; Camera</em>, and ensure <em>&quot;Let desktop apps access your camera&quot;</em> is toggled ON.
              </li>
              <li>
                <strong className="text-slate-200">Close other apps:</strong> Ensure Zoom, Teams, Skype, or browser tabs are not using the webcam.
              </li>
              <li>
                <strong className="text-slate-200">Hardware shutter:</strong> Check if your laptop camera has a physical privacy slider or toggle switch.
              </li>
            </ul>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              size="sm"
              variant="primary"
              onClick={handleGrantConsent}
              isLoading={isRequesting}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Retry Camera Permission
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSkipToDemo}
              icon={<EyeOff className="w-4 h-4" />}
            >
              Continue in Demo Mode (Simulated Data)
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left: Transparent Privacy Pledge */}
        <GlassCard variant="glow-violet" className="p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Our Strict On-Device Privacy Architecture
            </h3>

            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white">Pure In-Memory Processing:</strong> Frames captured by your webcam are handed directly to the local C ABI runtime in RAM via Electron IPC and discarded after analysis.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white">Zero Video Storage:</strong> No video files, images, or raw frames are ever saved to your disk or uploaded to any cloud server.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-cosmic-cyan mt-1.5 shrink-0" />
                <span>
                  <strong className="text-white">Local Encrypted Sessions:</strong> Session analytics (e.g., average heart rate, coherence scores) are saved exclusively in your local AppData folder and can be purged with one click.
                </span>
              </li>
            </ul>
          </div>

          {/* Camera Selection */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Video className="w-3.5 h-3.5 text-cosmic-cyan" />
              Select Video Device
            </label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-midnight-950 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cosmic-cyan"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
              {devices.length === 0 && <option value="">Default System Webcam</option>}
            </select>
          </div>
        </GlassCard>

        {/* Right: Live Preview Verification Container */}
        <GlassCard variant="default" className="p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-display font-bold text-white">Sensor Calibration Area</h3>
            <p className="text-xs text-slate-400">
              Position yourself comfortably facing the camera in a room with steady, even ambient light.
            </p>
          </div>

          <div className="h-64 w-full">
            <CameraPreview className="h-full w-full" />
          </div>

          <div className="pt-2 text-[11px] font-mono text-center text-slate-500">
            {hasGranted ? 'Permission granted. Loading workspace...' : 'Awaiting consent authorization'}
          </div>
        </GlassCard>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button
          size="lg"
          variant="primary"
          isLoading={isRequesting}
          onClick={handleGrantConsent}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          I Consent & Grant Camera Access
        </Button>

        <Button
          size="lg"
          variant="ghost"
          onClick={handleSkipToDemo}
          icon={<EyeOff className="w-4 h-4 text-purple-400" />}
        >
          Skip Camera (Visual Demo Mode)
        </Button>
      </div>
    </div>
  );
};
