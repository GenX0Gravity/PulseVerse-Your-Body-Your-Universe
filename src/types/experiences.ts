export type ActiveView = 
  | 'welcome'
  | 'consent'
  | 'dashboard'
  | 'live-sensing'
  | 'pulse-universe'
  | 'breathing-garden'
  | 'harmony'
  | 'interactive'
  | 'summary'
  | 'settings';

export type PulseUniversePreset = 'supernova' | 'quantum-void' | 'stellar-core' | 'aurora-pulsar';

export type BreathingGardenBiome = 'bioluminescent-grove' | 'twilight-canopy' | 'zen-lotus' | 'celestial-moss';

export type InteractiveMode = 
  | 'breathing-bloom' 
  | 'pulse-constellation' 
  | 'harmony-quest'
  | 'bio-resonance' 
  | 'chrono-pulse' 
  | 'stress-meltdown';

export interface ExperienceSettings {
  particleDensity: 'low' | 'medium' | 'high' | 'ultra';
  bloomIntensity: number; // 0.0 - 2.0
  cameraMotion: boolean;
  audioFeedback: boolean;
  pulseVisualAmplification: number; // 0.5 - 2.5
  breathingSensitivity: number; // 0.5 - 2.5
}
