import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Cpu,
  Lock,
  Trash2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Eye,
  Shield,
  Heart,
  Wind,
} from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';

interface OnboardingWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export const OnboardingWalkthroughModal: React.FC<OnboardingWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'what-is-pulseverse',
      title: '1. What PulseVerse Does',
      subtitle: 'Transforming Human Physiology into Living Cosmological Environments',
      icon: <Sparkles className="w-8 h-8 text-cosmic-cyan" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">PulseVerse — Your Body, Your Universe</strong> is an immersive desktop application created for the <strong>Presage SmartSpectra SDK Challenge 2026</strong>.
          </p>
          <p>
            It converts contactless, camera-derived physiological rhythms into living 3D worlds. Your real heartbeats become gravitational shockwaves across the <em>Pulse Universe</em>, your breathing rhythms unfurl luminous flora in the <em>Breathing Garden</em>, and dual cardiopulmonary synchrony drives the sacred geometry of <em>Harmony World</em>.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Heart className="w-5 h-5 text-cosmic-pink shrink-0" />
              <div>
                <span className="text-xs font-semibold text-white block">Cardiovascular Pulse</span>
                <span className="text-[11px] text-slate-400">Micro-vascular facial blushing</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
              <Wind className="w-5 h-5 text-cosmic-cyan shrink-0" />
              <div>
                <span className="text-xs font-semibold text-white block">Respiratory Cadence</span>
                <span className="text-[11px] text-slate-400">Optical thoracic kinematics</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'camera-measurement',
      title: '2. What the Camera Measures',
      subtitle: 'Contactless Remote Photoplethysmography (rPPG) & Thoracic Motion',
      icon: <Camera className="w-8 h-8 text-cosmic-pink" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            PulseVerse relies entirely on your standard laptop webcam or USB camera without wearables, finger clips, or contact sensors:
          </p>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
              <Eye className="w-4 h-4 text-cosmic-pink shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Facial Arterial Pulse (rPPG):</strong> Measures microscopic color fluctuations imperceptible to the naked eye as arterial blood surges through capillaries with each heartbeat.
              </span>
            </li>
            <li className="flex items-start gap-2.5 p-2 rounded-lg bg-white/5">
              <Wind className="w-4 h-4 text-cosmic-cyan shrink-0 mt-0.5" />
              <span>
                <strong className="text-white">Thoracic Displacement:</strong> Tracks subtle respiratory movements of the shoulders and upper chest to determine exact breathing rate and breath-cycle phase (inhalation vs. exhalation).
              </span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-processing',
      title: '3. What Data is Processed',
      subtitle: 'Pure In-Memory Volatile Processing via Presage C FFI Runtime',
      icon: <Cpu className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            Your privacy is guaranteed by architectural design in accordance with strict zero-leakage principles:
          </p>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
              <strong className="block text-emerald-300 font-semibold mb-1">✓ Volatile RAM Only</strong>
              Frames piped from the camera are processed in temporary volatile memory by the Presage C ABI runtime and discarded immediately after telemetry extraction.
            </div>
            <div className="p-3 rounded-xl bg-midnight-900 border border-white/10 text-slate-300">
              <strong className="block text-white font-semibold mb-1">🚫 No Photos or Videos Stored</strong>
              No photographs, video recordings, facial biometric templates, or identifying face landmarks are ever written to disk or recorded.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'telemetry-transmission',
      title: '4. What Information Leaves the Device',
      subtitle: 'Strict Zero-Cloud Architecture — 100% On-Device Execution',
      icon: <Lock className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">Nothing leaves your computer.</strong> PulseVerse is a fully self-contained local Electron desktop application:
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero external video streams or telemetry sent over the internet</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No user tracking, advertising SDKs, or third-party analytics</span>
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-white/5 text-slate-200">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>API keys are held in volatile memory for the active session only</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'session-control',
      title: '5. Stop & Delete Session Information',
      subtitle: 'Complete Control Over Hardware Lifecycle and Local Storage',
      icon: <Trash2 className="w-8 h-8 text-rose-400" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>
            You retain absolute sovereignty over camera hardware and any saved session summaries:
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block mb-1">One-Click Stop</span>
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-white">Space</kbd> or click &quot;End Session&quot; anytime to shut off the camera and release all hardware handles.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="font-semibold text-white block mb-1">Purge Local Data</span>
              <span>Navigate to <em>Privacy & Settings</em> and click &quot;Purge All Local Data&quot; to permanently erase all saved session records from disk.</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'medical-disclaimer',
      title: '6. Not a Medical Device',
      subtitle: 'Regulatory Compliance & Intended Use Disclaimer',
      icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs space-y-2">
            <strong className="text-amber-300 block text-sm font-bold uppercase tracking-wide">
              Important Non-Medical Notice
            </strong>
            <p>
              PulseVerse is an interactive creative technology application intended solely for wellness exploration, relaxation, and artistic biofeedback visualization.
            </p>
            <p>
              It is <strong>NOT</strong> an FDA-cleared, CE-marked, or certified medical diagnostic instrument. It should not be used for medical diagnosis, clinical decision-making, patient monitoring, or treatment of any physiological disorder.
            </p>
          </div>
          <p className="text-xs text-slate-400">
            Always seek the advice of a qualified healthcare professional with any questions regarding personal medical conditions or health metrics.
          </p>
        </div>
      ),
    },
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      if (onComplete) onComplete();
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="PulseVerse — Onboarding & Privacy Architecture"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Step Indicator Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cosmic-cyan to-cosmic-violet transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Header */}
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-midnight-900/60 border border-white/5">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            {current.icon}
          </div>
          <div className="space-y-0.5">
            <h3 className="text-base font-display font-bold text-white tracking-wide">
              {current.title}
            </h3>
            <p className="text-xs text-cosmic-cyan font-mono">
              {current.subtitle}
            </p>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="min-h-[220px]">
          {current.content}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            icon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-5 bg-cosmic-cyan' : 'bg-white/20 hover:bg-white/40'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleNext}
            icon={
              currentStep === steps.length - 1 ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            }
            iconPosition="right"
          >
            {currentStep === steps.length - 1 ? 'Understood & Continue' : 'Next'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
