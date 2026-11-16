import { create } from 'zustand';
import { ExperienceSettings } from '../types/experiences';
import { SessionRecord } from '../types/telemetry';

interface SettingsState {
  apiKey: string;
  cameraDeviceId: string;
  enableCardioMetrics: boolean;
  enableBreathingMetrics: boolean;
  enableFaceMetrics: boolean;
  experienceSettings: ExperienceSettings;
  savedSessions: SessionRecord[];

  setApiKey: (key: string) => void;
  setCameraDeviceId: (id: string) => void;
  setMetricEnabled: (metric: 'cardio' | 'breathing' | 'face', enabled: boolean) => void;
  updateExperienceSettings: (settings: Partial<ExperienceSettings>) => void;
  setSavedSessions: (sessions: SessionRecord[]) => void;
  refreshSessionsFromDisk: () => Promise<void>;
  purgeAllLocalData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  apiKey: import.meta.env.VITE_SMARTSPECTRA_API_KEY || '',
  cameraDeviceId: '',
  enableCardioMetrics: true,
  enableBreathingMetrics: true,
  enableFaceMetrics: true,
  experienceSettings: {
    particleDensity: 'high',
    bloomIntensity: 1.2,
    cameraMotion: true,
    audioFeedback: false,
    pulseVisualAmplification: 1.5,
    breathingSensitivity: 1.3,
  },
  savedSessions: [],

  setApiKey: (key) => set({ apiKey: key }),
  setCameraDeviceId: (id) => set({ cameraDeviceId: id }),
  setMetricEnabled: (metric, enabled) => {
    if (metric === 'cardio') set({ enableCardioMetrics: enabled });
    if (metric === 'breathing') set({ enableBreathingMetrics: enabled });
    if (metric === 'face') set({ enableFaceMetrics: enabled });
  },
  updateExperienceSettings: (partial) => {
    set((state) => ({
      experienceSettings: { ...state.experienceSettings, ...partial },
    }));
  },
  setSavedSessions: (sessions) => set({ savedSessions: sessions }),

  refreshSessionsFromDisk: async () => {
    if (window.pulseVerse) {
      try {
        const sessions = await window.pulseVerse.getSessions();
        if (Array.isArray(sessions)) {
          set({ savedSessions: sessions as SessionRecord[] });
        }
      } catch (err) {
        console.error('Failed to load local sessions:', err);
      }
    }
  },

  purgeAllLocalData: async () => {
    if (window.pulseVerse) {
      try {
        await window.pulseVerse.clearSessions();
        set({ savedSessions: [] });
      } catch (err) {
        console.error('Failed to clear sessions:', err);
      }
    } else {
      set({ savedSessions: [] });
    }
  },
}));
