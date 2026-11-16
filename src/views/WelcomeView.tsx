import React, { useState } from 'react';
import { ArrowRight, Sparkles, Orbit, Flower2, Shield, Play, HelpCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GlassCard } from '../components/common/GlassCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { OnboardingWalkthroughModal } from '../components/common/OnboardingWalkthroughModal';

export const WelcomeView: React.FC = () => {
  const { setActiveView, setMode, setOnboardingCompleted } = useAppStore();
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);

  const handleStartOnboarding = () => {
    setActiveView('consent');
  };

  const handleDemoMode = () => {
    setMode('demo');
    setOnboardingCompleted(true);
    setActiveView('dashboard');
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)] animate-fade-in select-none">
      {/* Top Pill */}
      <Badge variant="cyan" pulse size="md" className="mb-6">
        Presage SmartSpectra SDK Challenge 2026
      </Badge>

      {/* Main Title & Tagline */}
      <div className="text-center space-y-4 max-w-3xl">
        <h1 className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
          Your Body.{' '}
          <span className="bg-gradient-to-r from-cosmic-cyan via-purple-300 to-cosmic-violet bg-clip-text text-transparent">
            Your Universe.
          </span>
        </h1>
        <p className="text-lg text-slate-300 font-light leading-relaxed">
          Transform your real cardiovascular pulse and respiratory rhythms into living generative cosmic environments. No wearables. No sensors. 100% private, on-device optical sensing.
        </p>
      </div>

      {/* 3 Pillars Showcase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full my-10">
        <GlassCard variant="glow-cyan" hoverEffect className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cosmic-cyan/15 border border-cosmic-cyan/30 flex items-center justify-center text-cosmic-cyan shadow-glow-cyan">
            <Orbit className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Pulse Universe</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every heartbeat triggers an expanding gravitational shockwave through a living 3D cosmic star nebula.
          </p>
        </GlassCard>

        <GlassCard variant="glow-violet" hoverEffect className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cosmic-violet/20 border border-cosmic-violet/40 flex items-center justify-center text-purple-300 shadow-glow-violet">
            <Flower2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Breathing Garden</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Inhale and exhale in unison with glowing bioluminescent flora and ascending particle spore clouds.
          </p>
        </GlassCard>

        <GlassCard variant="subtle" hoverEffect className="p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-display font-bold text-white">Private & Safe</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Frames are processed strictly locally by the Presage SmartSpectra C ABI engine. Zero images or video leave your PC.
          </p>
        </GlassCard>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Button
          size="lg"
          variant="primary"
          onClick={handleStartOnboarding}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Begin Experience & Camera Setup
        </Button>

        <Button
          size="lg"
          variant="secondary"
          onClick={handleDemoMode}
          icon={<Play className="w-4 h-4 text-purple-400" />}
        >
          Explore in Demo Mode (No Camera)
        </Button>
      </div>

      {/* Walkthrough & Footnote */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-slate-400 font-mono mt-8">
        <button
          onClick={() => setIsWalkthroughOpen(true)}
          className="text-cosmic-cyan hover:underline flex items-center gap-1.5 font-semibold"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Read Privacy & Technical Architecture Walkthrough</span>
        </button>
        <span className="hidden sm:inline text-slate-600">•</span>
        <div className="flex items-center gap-1.5 text-slate-500">
          <Sparkles className="w-3.5 h-3.5 text-cosmic-cyan" />
          <span>Powered by @smartspectra/node-sdk v3.5.0 Pure-FFI</span>
        </div>
      </div>

      <OnboardingWalkthroughModal
        isOpen={isWalkthroughOpen}
        onClose={() => setIsWalkthroughOpen(false)}
      />
    </div>
  );
};
