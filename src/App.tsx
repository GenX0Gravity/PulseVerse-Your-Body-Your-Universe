import React from 'react';
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

  // Onboarding screens render standalone without full shell navigation
  if (activeView === 'welcome') {
    return (
      <div className="min-h-screen w-screen bg-midnight-950 text-slate-100 flex flex-col justify-center overflow-auto">
        <WelcomeView />
      </div>
    );
  }

  if (activeView === 'consent') {
    return (
      <div className="min-h-screen w-screen bg-midnight-950 text-slate-100 flex flex-col justify-center overflow-auto">
        <ConsentView />
      </div>
    );
  }

  // Active workspace rendered inside responsive application shell
  return (
    <Shell>
      {activeView === 'dashboard' && <DashboardView />}
      {activeView === 'live-sensing' && <LiveSensingView />}
      {activeView === 'pulse-universe' && <PulseUniverseView />}
      {activeView === 'breathing-garden' && <BreathingGardenView />}
      {activeView === 'harmony' && <HarmonyView />}
      {activeView === 'interactive' && <InteractiveExperiencesView />}
      {activeView === 'summary' && <SessionSummaryView />}
      {activeView === 'settings' && <PrivacySettingsView />}
    </Shell>
  );
};

export default App;
