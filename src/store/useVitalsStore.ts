import { create } from 'zustand';
import { VitalTelemetry } from '../types/telemetry';

interface VitalsState {
  telemetry: VitalTelemetry;
  historicalPulse: number[];
  historicalBreathing: number[];
  historicalCoherence: number[];

  // Real-time mutations
  updateVitals: (partial: Partial<VitalTelemetry>) => void;
  pushWaveformSample: (pulseVal: number, breathingVal: number) => void;
  recordPulseBeat: (bpm: number) => void;
  recordBreathCycle: (brpm: number, isInhaling: boolean) => void;
  resetTelemetry: () => void;
  resetVitals: () => void;
}

const MAX_WAVEFORM_POINTS = 160;
const MAX_HISTORY_POINTS = 300;

const initialTelemetry: VitalTelemetry = {
  pulseBpm: null,
  breathingBrpm: null,
  hrvRmssd: null,
  coherenceScore: 75,
  signalQuality: 0,
  pulseWaveform: new Array(MAX_WAVEFORM_POINTS).fill(0),
  breathingWaveform: new Array(MAX_WAVEFORM_POINTS).fill(0),
  lastHeartbeatTime: 0,
  lastBreathPeakTime: 0,
  isBreathingIn: false,
  fps: 30,
  latencyMs: 16,
  trackingHint: 'Waiting for camera feed...',
  isFaceDetected: false,
};

export const useVitalsStore = create<VitalsState>((set) => ({
  telemetry: initialTelemetry,
  historicalPulse: [],
  historicalBreathing: [],
  historicalCoherence: [],

  updateVitals: (partial) => {
    set((state) => ({
      telemetry: { ...state.telemetry, ...partial },
    }));
  },

  pushWaveformSample: (pulseVal, breathingVal) => {
    set((state) => {
      const nextPulseWaveform = [...state.telemetry.pulseWaveform.slice(1), pulseVal];
      const nextBreathingWaveform = [...state.telemetry.breathingWaveform.slice(1), breathingVal];

      return {
        telemetry: {
          ...state.telemetry,
          pulseWaveform: nextPulseWaveform,
          breathingWaveform: nextBreathingWaveform,
        },
      };
    });
  },

  recordPulseBeat: (bpm) => {
    const now = Date.now();
    set((state) => {
      const hist = [...state.historicalPulse, bpm].slice(-MAX_HISTORY_POINTS);
      return {
        historicalPulse: hist,
        telemetry: {
          ...state.telemetry,
          pulseBpm: Math.round(bpm),
          lastHeartbeatTime: now,
        },
      };
    });
  },

  recordBreathCycle: (brpm, isInhaling) => {
    const now = Date.now();
    set((state) => {
      const hist = [...state.historicalBreathing, brpm].slice(-MAX_HISTORY_POINTS);
      return {
        historicalBreathing: hist,
        telemetry: {
          ...state.telemetry,
          breathingBrpm: Math.round(brpm * 10) / 10,
          isBreathingIn: isInhaling,
          lastBreathPeakTime: now,
        },
      };
    });
  },

  resetTelemetry: () => {
    set({
      telemetry: initialTelemetry,
      historicalPulse: [],
      historicalBreathing: [],
      historicalCoherence: [],
    });
  },

  resetVitals: () => {
    set({
      telemetry: initialTelemetry,
      historicalPulse: [],
      historicalBreathing: [],
      historicalCoherence: [],
    });
  },
}));
