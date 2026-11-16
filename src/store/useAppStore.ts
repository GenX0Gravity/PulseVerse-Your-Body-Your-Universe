import { create } from 'zustand';
import { ActiveView } from '../types/experiences';
import { SessionRecord } from '../types/telemetry';

interface AppState {
  activeView: ActiveView;
  previousView: ActiveView | null;
  hasCompletedOnboarding: boolean;
  hasConsentedCamera: boolean;
  mode: 'live' | 'demo';
  isSessionActive: boolean;
  sessionStartTime: number | null;
  currentSession: SessionRecord | null;
  theme: 'dark' | 'light';
  
  // Actions
  setActiveView: (view: ActiveView) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setCameraConsented: (consented: boolean) => void;
  setMode: (mode: 'live' | 'demo') => void;
  startSession: () => void;
  stopSession: () => SessionRecord | null;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeView: 'welcome',
  previousView: null,
  hasCompletedOnboarding: false,
  hasConsentedCamera: false,
  mode: 'live',
  isSessionActive: false,
  sessionStartTime: null,
  currentSession: null,
  theme: 'dark',

  setActiveView: (view: ActiveView) => {
    const current = get().activeView;
    if (current !== view) {
      set({ previousView: current, activeView: view });
    }
  },

  setOnboardingCompleted: (completed: boolean) => {
    set({ hasCompletedOnboarding: completed });
  },

  setCameraConsented: (consented: boolean) => {
    set({ hasConsentedCamera: consented });
  },

  setMode: (mode: 'live' | 'demo') => {
    set({ mode });
  },

  startSession: () => {
    set({
      isSessionActive: true,
      sessionStartTime: Date.now(),
      currentSession: null,
    });
  },

  stopSession: () => {
    const { sessionStartTime, mode } = get();
    if (!sessionStartTime) return null;

    const endTime = Date.now();
    const durationSeconds = Math.max(1, Math.round((endTime - sessionStartTime) / 1000));

    const finalSession: SessionRecord = {
      id: `session_${Date.now()}`,
      startTime: sessionStartTime,
      endTime,
      durationSeconds,
      mode,
      avgPulseBpm: 72,
      minPulseBpm: 65,
      maxPulseBpm: 84,
      avgBreathingBrpm: 14,
      avgCoherenceScore: 78,
      pulseHistory: [],
      breathingHistory: [],
      coherenceHistory: [],
    };

    set({
      isSessionActive: false,
      sessionStartTime: null,
      currentSession: finalSession,
    });

    // Save locally via IPC if running in Electron
    if (window.pulseVerse) {
      window.pulseVerse.saveSession(finalSession).catch(console.error);
    }

    return finalSession;
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setTheme: (theme: 'dark' | 'light') => {
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
}));
