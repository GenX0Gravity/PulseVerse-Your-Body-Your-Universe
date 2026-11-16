export interface VitalTelemetry {
  // Current values
  pulseBpm: number | null;
  breathingBrpm: number | null;
  hrvRmssd: number | null;
  coherenceScore: number; // 0 - 100 resonance score
  signalQuality: number; // 0 - 100 quality percentage
  
  // Real-time raw waveform stream buffers (normalized for renderers)
  pulseWaveform: number[];
  breathingWaveform: number[];
  
  // Timestamps and status
  lastHeartbeatTime: number;
  lastBreathPeakTime: number;
  isBreathingIn: boolean;
  
  // Diagnostics
  fps: number;
  latencyMs: number;
  trackingHint: string;
  isFaceDetected: boolean;
}

export interface SessionRecord {
  id: string;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  mode: 'live' | 'demo';
  avgPulseBpm: number;
  minPulseBpm: number;
  maxPulseBpm: number;
  avgBreathingBrpm: number;
  avgCoherenceScore: number;
  pulseHistory: number[];
  breathingHistory: number[];
  coherenceHistory: number[];
  notes?: string;
}
