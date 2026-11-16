import React, { useState } from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Modal } from '../common/Modal';
import { OnboardingWalkthroughModal } from '../common/OnboardingWalkthroughModal';
import { FloatingCameraHUD } from '../camera/FloatingCameraHUD';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useSmartSpectra } from '../../hooks/useSmartSpectra';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  // Activate keyboard navigation listeners
  useKeyboardNavigation(() => setIsHelpOpen(true));

  // Activate background SmartSpectra pipeline listener
  useSmartSpectra();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-midnight-950 text-slate-100 select-none">
      {/* Frameless Futuristic Title Bar */}
      <TitleBar />

      <div className="flex flex-1 overflow-hidden">
        {/* Responsive Navigation Sidebar */}
        <Sidebar
          onOpenHelp={() => setIsHelpOpen(true)}
          onOpenWalkthrough={() => setIsWalkthroughOpen(true)}
        />

        {/* Main Content Area with Header */}
        <div className="flex flex-col flex-1 overflow-hidden bg-gradient-to-br from-midnight-950 via-midnight-900 to-midnight-950">
          <Header />
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 relative focus:outline-none" tabIndex={-1}>
            {children}
          </main>
        </div>
      </div>

      {/* Floating Picture-in-Picture Camera & Biometric HUD */}
      <FloatingCameraHUD />

      {/* Onboarding & Privacy Architecture Walkthrough */}
      <OnboardingWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />

      {/* Keyboard Shortcuts & Help Modal */}
      <Modal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="PulseVerse — Keyboard Shortcuts & Controls"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-slate-300 text-sm">
            PulseVerse provides full accessible keyboard navigation for hands-free biofeedback exploration:
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Main Dashboard</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                1 or D
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Live Sensing Reticle</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                2 or L
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Pulse Universe (3D)</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                3 or P
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Breathing Garden (3D)</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                4 or B
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Harmony Mode (Dual Bio)</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                H
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Interactive Experiences</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                5 or I
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Session Summary</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                6 or U
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Privacy & Settings</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                7 or ,
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Start / Stop Camera Session</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                Space
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Toggle Live vs Demo Mode</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                M
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Toggle Fullscreen Experience</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                F
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
              <span>Toggle Ambient Sound</span>
              <kbd className="px-2 py-0.5 font-mono bg-midnight-900 border border-white/10 rounded text-cosmic-cyan">
                S
              </kbd>
            </div>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => {
                setIsHelpOpen(false);
                setIsWalkthroughOpen(true);
              }}
              className="text-xs text-cosmic-cyan hover:underline font-semibold"
            >
              Open Privacy & Architecture Walkthrough →
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
