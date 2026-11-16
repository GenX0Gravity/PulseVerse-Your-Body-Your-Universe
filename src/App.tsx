import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import { Shell } from './components/layout/Shell';
import { WelcomeView } from './views/WelcomeView';
import { ConsentView } from './views/ConsentView';
import { DashboardView } from './views/DashboardView';
import { LiveSensingView } from './views/LiveSensingView';
import { PulseUniverseView } from './views/PulseUniverseView';
import { BreathingGardenView } from './views/BreathingGardenView';
import { HarmonyView } from './views/HarmonyView';
import { InteractiveExperiencesView } from './views/InteractiveExperiencesView';
import { SessionSummaryView } from './views/SessionSummaryView';
import { PrivacySettingsView } from './views/PrivacySettingsView';

export const App: React.FC = () => {
  const { activeView } = useAppStore();

  // Onboarding screens render standalone with smooth cinematic transitions
  if (activeView === 'welcome' || activeView === 'consent') {
    return (
      <div className="min-h-screen w-screen bg-midnight-950 text-slate-100 flex flex-col justify-center overflow-auto">
        <AnimatePresence mode="wait">
          {activeView === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <WelcomeView />
            </motion.div>
          )}
          {activeView === 'consent' && (
            <motion.div
              key="consent"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ConsentView />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Active workspace rendered inside responsive application shell with fluid view transitions
  return (
    <Shell>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full h-full"
        >
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'live-sensing' && <LiveSensingView />}
          {activeView === 'pulse-universe' && <PulseUniverseView />}
          {activeView === 'breathing-garden' && <BreathingGardenView />}
          {activeView === 'harmony' && <HarmonyView />}
          {activeView === 'interactive' && <InteractiveExperiencesView />}
          {activeView === 'summary' && <SessionSummaryView />}
          {activeView === 'settings' && <PrivacySettingsView />}
        </motion.div>
      </AnimatePresence>
    </Shell>
  );
};

export default App;
