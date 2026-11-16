import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Key,
  Cpu,
  Video,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Check,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAppStore } from '../store/useAppStore';
import { useVitalsStore } from '../store/useVitalsStore';
import { useCamera } from '../hooks/useCamera';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { OnboardingWalkthroughModal } from '../components/common/OnboardingWalkthroughModal';

export const PrivacySettingsView: React.FC = () => {
  const {
    apiKey,
    setApiKey,
    purgeAllLocalData,
  } = useSettingsStore();

  const { theme, setTheme, hasConsentedCamera, setCameraConsented, stopSession, setMode, setActiveView } = useAppStore();
  const { resetVitals } = useVitalsStore();
  const { devices, selectedDeviceId, setSelectedDeviceId } = useCamera();

  const [showKey, setShowKey] = useState(false);
  const [keySavedMessage, setKeySavedMessage] = useState(false);
  const [sessionClearedMessage, setSessionClearedMessage] = useState(false);
  const [consentRevokedMessage, setConsentRevokedMessage] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const [appInfo, setAppInfo] = useState<any>({
    platform: 'win32',
    arch: 'x64',
    nodeVersion: '26.7.0',
    electronVersion: '33.2.0',
    version: '1.0.0',
  });

  useEffect(() => {
    if (window.pulseVerse?.getAppInfo) {
      window.pulseVerse.getAppInfo().then(setAppInfo).catch(console.warn);
    }
  }, []);

  const handleSaveKey = () => {
    setKeySavedMessage(true);
    setTimeout(() => setKeySavedMessage(false), 2000);
  };

  const handleClearActiveSession = () => {
    stopSession();
    resetVitals();
    setSessionClearedMessage(true);
    setTimeout(() => setSessionClearedMessage(false), 2500);
  };

  const handleRevokeConsent = () => {
    stopSession();
    resetVitals();
    setCameraConsented(false);
    setMode('demo');
    setConsentRevokedMessage(true);
    setTimeout(() => setConsentRevokedMessage(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-white tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Privacy, Security & Engine Settings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Zero-leakage local architecture, in-memory credential storage, and explicit consent controls.
          </p>
        </div>

        <Button
          size="sm"
          variant="glow-cyan"
          onClick={() => setIsWalkthroughOpen(true)}
          icon={<HelpCircle className="w-4 h-4" />}
        >
          View Privacy Architecture
        </Button>
      </div>

      {/* Responsible Use & Medical Purpose Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-midnight-900 to-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-1.5 shadow-lg">
        <div className="flex items-center gap-2 font-bold text-amber-300 uppercase tracking-wider text-[11px]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Responsible Use & Non-Medical Notice</span>
        </div>
        <p className="leading-relaxed text-slate-300">
          PulseVerse is strictly designed for <strong className="text-white">general wellness and informational exploration</strong>. It does not diagnose medical conditions, recommend medical treatments, or infer mental health disorders from pulse or breathing. Always consult a physician for health concerns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Presage SmartSpectra API Key Configuration */}
        <GlassCard variant="glow-violet" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              Presage Developer Key
            </h3>
            <Badge variant="violet" size="sm">
              In-Memory Session
            </Badge>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Obtain your API key from the{' '}
            <a
              href="https://smartspectra.presagetech.com"
              target="_blank"
              rel="noreferrer"
              className="text-cosmic-cyan hover:underline font-semibold"
            >
              Presage Developer Portal
            </a>
            . Your key is stored strictly in volatile memory for the active session and is never written to public source code or sent to third-party endpoints.
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Presage API Key (held in memory)..."
                className="w-full bg-midnight-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cosmic-cyan pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button size="sm" variant="primary" onClick={handleSaveKey}>
                Apply Key to Session
              </Button>
              {keySavedMessage && (
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1 animate-fade-in">
                  <Check className="w-3.5 h-3.5" />
                  Key Applied In-Memory
                </span>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Telemetry Disclosure & SDK Network Behavior */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              SDK Telemetry & Outbound Traffic
            </h3>
            <Badge variant="emerald" size="sm">
              Telemetry Disabled
            </Badge>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            PulseVerse initializes <code className="text-cosmic-cyan">@smartspectra/node-sdk</code> with <code className="text-cosmic-cyan">enableTelemetry: false</code>. No diagnostic usage telemetry packets are sent to Presage.
          </p>

          <div className="p-3 rounded-xl bg-midnight-950/70 border border-white/5 space-y-2 text-xs">
            <span className="font-semibold text-white block">Transparent Network Disclosure:</span>
            <ul className="space-y-1 list-disc list-inside text-slate-400 text-[11px]">
              <li>
                <strong className="text-slate-300">API Key Authentication:</strong> When starting a live session, the SDK pings Presage servers (<code className="text-slate-300">https://*.presagetech.com</code>) strictly to verify developer key validity.
              </li>
              <li>
                <strong className="text-slate-300">Video Processing:</strong> Optical rPPG and thoracic kinematics are computed 100% locally on your CPU/GPU via the native C ABI engine.
              </li>
              <li>
                <strong className="text-slate-300">Zero Cloud Analytics:</strong> No third-party analytics (Google Analytics, Sentry, Mixpanel) exist in this application.
              </li>
            </ul>
          </div>
        </GlassCard>

        {/* Hardware Camera Device Selection */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-cosmic-cyan" />
            Hardware Camera Device
          </h3>

          <p className="text-xs text-slate-300">
            Select the camera device used for optical signal acquisition. Front-facing 720p 30 FPS cameras are recommended.
          </p>

          <div className="space-y-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full bg-midnight-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cosmic-cyan font-mono"
            >
              {devices.map((d) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label}
                </option>
              ))}
              {devices.length === 0 && <option value="">Default System Webcam</option>}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-midnight-950/60 border border-white/5 text-[11px] text-slate-400 space-y-1 font-mono">
            <div className="font-semibold text-slate-300">Constraints & Hardware Profile</div>
            <div>Resolution: 1280x720 • Target Frame Rate: 30 FPS • MediaStreamTrackProcessor</div>
          </div>
        </GlassCard>

        {/* System & Architecture Diagnostics */}
        <GlassCard variant="default" className="p-6 space-y-4">
          <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            System & Runtime Architecture
          </h3>

          <div className="space-y-2 font-mono text-xs text-slate-300">
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Platform / Architecture:</span>
              <span className="text-white">{appInfo.platform} ({appInfo.arch})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Electron Context Isolation:</span>
              <span className="text-emerald-400 font-bold">Enabled (Sandboxed)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">Renderer Node Integration:</span>
              <span className="text-emerald-400 font-bold">Disabled (Secure)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">FFI Binding Provider:</span>
              <span className="text-cosmic-cyan">koffi Pure-ABI</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">SDK Version:</span>
              <span className="text-purple-300">@smartspectra/node-sdk v3.5.0</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Consent Management & Immediate Withdrawal */}
      <GlassCard variant="default" className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-display font-bold text-white">Camera Consent & Authorization</h3>
              <Badge variant={hasConsentedCamera ? 'emerald' : 'slate'} size="sm">
                {hasConsentedCamera ? 'Consent Active' : 'Consent Withdrawn'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              You may withdraw your camera consent at any time. Revoking consent immediately shuts down the camera hardware, releases OS handles, and sets the app into visual-only Demo mode.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {hasConsentedCamera ? (
              <Button
                size="md"
                variant="secondary"
                onClick={handleRevokeConsent}
                icon={<EyeOff className="w-4 h-4 text-rose-400" />}
              >
                Withdraw Camera Consent
              </Button>
            ) : (
              <Button
                size="md"
                variant="glow-cyan"
                onClick={() => setActiveView('consent')}
                icon={<Eye className="w-4 h-4" />}
              >
                Grant Camera Consent
              </Button>
            )}
          </div>
        </div>

        {consentRevokedMessage && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono">
            Camera consent revoked. Hardware stream released and session cleared.
          </div>
        )}
      </GlassCard>

      {/* Theme and Appearance Preference */}
      <GlassCard variant="default" className="p-6 space-y-4">
        <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-400" />
          Visual Theme & Design Language
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
              theme === 'dark'
                ? 'border-cosmic-cyan bg-cosmic-cyan/15 text-white shadow-glow-cyan'
                : 'border-white/10 bg-midnight-950/60 text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-5 h-5 text-purple-400" />
            <div className="text-left">
              <div className="text-sm font-bold">Futuristic Cosmic Midnight</div>
              <div className="text-xs text-slate-400">Deep navy, violet, and cyan luminous glass</div>
            </div>
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
              theme === 'light'
                ? 'border-amber-400 bg-amber-400/15 text-white shadow-glow-cyan'
                : 'border-white/10 bg-midnight-950/60 text-slate-400 hover:text-white'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <div className="text-left">
              <div className="text-sm font-bold">Light Sanctuary Mode</div>
              <div className="text-xs text-slate-400">High-clarity daytime presentation mode</div>
            </div>
          </button>
        </div>
      </GlassCard>

      {/* Session Data Hygiene & Complete Storage Deletion */}
      <GlassCard variant="subtle" className="p-6 space-y-4 border-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              Session Data Hygiene & Permanent Purge
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Clear current in-memory vitals or permanently erase all saved session records and diagnostic history from this computer.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClearActiveSession}
              icon={<RotateCcw className="w-4 h-4 text-cosmic-cyan" />}
            >
              Clear Active Session
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={purgeAllLocalData}
              icon={<Trash2 className="w-4 h-4" />}
            >
              Purge All Saved Records
            </Button>
          </div>
        </div>

        {sessionClearedMessage && (
          <div className="p-3 rounded-xl bg-cosmic-cyan/15 border border-cosmic-cyan/30 text-cosmic-cyan text-xs font-mono">
            Active in-memory telemetry, oscilloscope buffers, and pulse history cleared.
          </div>
        )}
      </GlassCard>

      <OnboardingWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
};
